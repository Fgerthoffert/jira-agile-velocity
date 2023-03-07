/* eslint max-depth: ["error", 7] */
/* eslint max-params: ["error", 7] */
/* eslint-env es6 */

import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import * as fsNdjson from 'fs-ndjson';

import { IJiraIssue, UserConfigJira } from '../../global';
import jiraSearchIssues from '../jira/searchIssues';
import { differenceInBusinessDays } from 'date-fns';
import { getId } from '../misc/id';
import { returnTicketsPoints } from '../misc/jiraUtils';

/*
    Fetches all issues attached to a version
*/
const getIssues = async (
  jiraConfig: UserConfigJira,
  version: any,
  cacheDir: string,
) => {
  cli.action.start(`${version.name}: Begin fetching issues for this version`);

  const issues: Array<IJiraIssue> = [];

  const versionsFolder = path.join(cacheDir, 'versions');
  // Create folder to be used to store the versions cache
  fs.mkdirSync(versionsFolder, { recursive: true });

  const versionFilepath = path.join(
    versionsFolder,
    `${getId(version.name)}.ndjson`,
  );

  // If a file is marked clear, it gets deleted
  // .clear file are simply used by the UI to know how many files are pending data refresh
  // And therefore avoid having a very large number of deletion requests triggered at once from the UI
  if (fs.existsSync(versionFilepath + '.clear')) {
    fs.unlinkSync(versionFilepath + '.clear');
  }

  // If the version is not released, always refetch its issues
  if (!fs.existsSync(versionFilepath) || version.released === false) {
    const issuesJira = await jiraSearchIssues(
      jiraConfig,
      `fixVersion = "${version.name}"`,
      '*all,-comments,labels,created,summary,status,issuetype,assignee,project,resolution,resolutiondate' +
        jiraConfig.fields.points +
        ',' +
        jiraConfig.fields.originalPoints,
    );

    // Note: We'd still write an empty file to cache to record the fact that no issues were part of this versions
    const versionFileStream = fs.createWriteStream(versionFilepath, {
      flags: 'a',
    });
    if (issuesJira.length > 0) {
      if (version.releaseDate === undefined) {
        console.log(version.name, ' - No release date present');
      }
      for (const issue of issuesJira) {
        let daysToRelease;
        let weeksToRelease;
        let monthsToRelease;
        let daysToReleaseIfToday;
        let weeksToReleaseIfToday;
        let monthsToReleaseIfToday;
        let daysToResolution;
        let weeksToResolution;
        let monthsToResolution;

        // Verify the release date is present
        if (version.releaseDate !== undefined) {
          daysToRelease = differenceInBusinessDays(
            new Date(version.releaseDate),
            new Date(issue.fields.created),
          );
          if (daysToRelease > 0) {
            weeksToRelease = Math.round(daysToRelease / 5);
            monthsToRelease = Math.round(daysToRelease / 21.74);
          } else {
            daysToRelease = undefined;
          }
        } else if (
          issue.fields.resolutiondate !== undefined &&
          issue.fields.resolutiondate !== null
        ) {
          daysToReleaseIfToday = differenceInBusinessDays(
            new Date(),
            new Date(issue.fields.created),
          );
          if (daysToReleaseIfToday > 0) {
            weeksToReleaseIfToday = Math.round(daysToReleaseIfToday / 5);
            monthsToReleaseIfToday = Math.round(daysToReleaseIfToday / 21.74);
          } else {
            daysToReleaseIfToday = undefined;
          }
        }
        if (
          issue.fields.resolutiondate !== undefined &&
          issue.fields.resolutiondate !== null
        ) {
          daysToResolution = differenceInBusinessDays(
            new Date(issue.fields.resolutiondate),
            new Date(issue.fields.created),
          );
          if (daysToResolution > 0) {
            weeksToResolution = Math.round(daysToResolution / 5);
            monthsToResolution = Math.round(daysToResolution / 21.74);
          } else {
            daysToResolution = undefined;
          }
        }
        const updatedIssue = {
          ...issue,
          points: returnTicketsPoints(issue, jiraConfig),
          daysToRelease,
          weeksToRelease,
          monthsToRelease,
          daysToReleaseIfToday,
          weeksToReleaseIfToday,
          monthsToReleaseIfToday,
          daysToResolution,
          weeksToResolution,
          monthsToResolution,
        };

        issues.push(updatedIssue);
        versionFileStream.write(JSON.stringify(updatedIssue) + '\n');
      }
    }
    versionFileStream.end();
  } else {
    const cachedIssues = fsNdjson.readFileSync(versionFilepath);
    for (const issue of cachedIssues) {
      issues.push(issue);
    }
  }

  cli.action.stop(`done, ${issues.length} issues`);

  return issues;
};

export default getIssues;
