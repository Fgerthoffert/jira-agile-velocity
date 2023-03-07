/* eslint max-depth: ["error", 5] */
import { flags } from '@oclif/command';
import * as path from 'path';
import * as fs from 'fs';

import { parse } from 'date-fns';

import Command from '../base';
import getVersions from '../utils/versions/getVersions';
import groupVersions from '../utils/versions/groupVersions';
import getIssues from '../utils/versions/getIssues';
import trimIssues from '../utils/versions/trimIssues';

const sortByNameDesc = (a: any, b: any) => {
  // Use toUpperCase() to ignore character casing
  const keyA = a.name.toUpperCase();
  const keyB = b.name.toUpperCase();

  let comparison = 0;
  if (keyA > keyB) {
    comparison = -1;
  } else if (keyA < keyB) {
    comparison = 1;
  }
  return comparison;
};

export default class Streams extends Command {
  static description = 'Fetches details about completed versions';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    useCache: flags.boolean({
      char: 'c',
      default: false,
      description: 'Use local cache instead of fetching the data from Jira',
    }),
  };

  async run() {
    const { flags } = this.parse(Streams);
    const userConfig = this.userConfig;
    const cacheDir = path.join(this.config.configDir, 'cache');

    // Collect raw versions from the configured projects in Jira
    let versions: any = [];
    for (const projectKey of userConfig.versions.projectKeys) {
      this.log(`Fetching versions for project: ${projectKey}`);

      const projectVersions: Array<any> = await getVersions(
        projectKey,
        userConfig.jira,
      );
      this.log(
        `Fetched: ${projectVersions.length} version from project: ${projectKey}`,
      );
      versions.push(...projectVersions);
    }
    this.log(
      `Fetched a total of ${versions.length} individual versions across all projets`,
    );

    // Filter out versions with a release date prior to the one set in the config
    versions = versions.filter(
      (v: any) =>
        v.releaseDate === undefined ||
        v.releaseDate.getTime() >
          parse(userConfig.versions.from, 'yyyy-MM-dd', new Date()),
    );
    this.log(
      `There is a total of ${versions.length} versions released after ${userConfig.versions.from}`,
    );

    // Regroup versions by name (issues spanning multiple projects)
    versions = groupVersions(versions);
    this.log(
      `There is a total of ${versions.length} unique versions (when groupped by name)`,
    );

    // Sort the versions by name
    versions = versions.sort(sortByNameDesc);

    // Fetch all issues corresponding to these versions
    // The list of issues is cached to avoid re-fetching
    const versionsWithIssues = [];

    // An issue is only counted once,
    // this array is used to keep track of issues
    const fetchedIssues: any = [];
    for (const version of versions) {
      let issues = await getIssues(userConfig.jira, version, cacheDir);
      // Trim issues object to reduce the payload
      // Filter out issues that are already present
      issues = trimIssues(issues).filter(i => {
        if (fetchedIssues.includes(i.key)) {
          return false;
        }
        fetchedIssues.push(i.key);
        return true;
      });
      versionsWithIssues.push({
        ...version,
        issues,
      });
    }

    this.log(`Writing all analyzed versions to cache`);

    const fileStream = fs.createWriteStream(
      path.join(cacheDir, `versions.json`),
      { flags: 'w' },
    );
    fileStream.write(
      JSON.stringify({
        versions: versionsWithIssues,
        updatedAt: new Date().toJSON(),
        jiraHost: userConfig.jira.host,
        monthsToChart: userConfig.versions.monthsToChart,
        defaultFilters: {
          name:
            userConfig.versions.defaultFilters.name !== undefined
              ? userConfig.versions.defaultFilters.name
              : '',
          projectKey:
            userConfig.versions.defaultFilters.projectKey !== undefined
              ? userConfig.versions.defaultFilters.projectKey
              : '',
          label:
            userConfig.versions.defaultFilters.label !== undefined
              ? userConfig.versions.defaultFilters.label
              : '',
          issueType:
            userConfig.versions.defaultFilters.issueType !== undefined
              ? userConfig.versions.defaultFilters.issueType
              : '',
          priority:
            userConfig.versions.defaultFilters.priority !== undefined
              ? userConfig.versions.defaultFilters.priority
              : '',
        },
      }),
    );
    fileStream.end();
  }
}
