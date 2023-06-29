/* eslint max-depth: ["error", 5] */
import { flags } from '@oclif/command';
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';
import { Octokit } from 'octokit';

import Command from '../base';

import jiraSearchIssues from '../utils/jira/searchIssues';

import { getStreamsCachePerTeam } from '../utils/streams/getStreamsCachePerTeam';
import { createDistributionTable } from '../utils/report/createDistributionTable';
import { createReleasePipelineTable } from '../utils/report/createReleasePipelineTable';
import { getInitiatives } from '../utils/report/getInitiatives';
import { createInitiativesOverviewTable } from '../utils/report/createInitiativesOverviewTable';
import { createInitiativeDetails } from '../utils/report/createInitiativeDetails';

export default class Report extends Command {
  static description = 'Fetches Completion and Forecast streams per team';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    save: flags.boolean({
      char: 's',
      default: false,
      description: 'Save a cache file and submit data to GitHub Issues',
    }),
  };

  async run() {
    const { flags } = this.parse(Report);
    const userConfig = this.userConfig;
    const cacheDir = path.join(this.config.configDir, 'cache');

    // Get data from Jira
    this.log('Getting Release pipeline issues from Jira');
    const releaseTicketsRaw = await jiraSearchIssues(
      userConfig.jira,
      userConfig.report.releasePipeline.jql,
      '*all,-comments,labels,created,summary,status,issuetype,assignee,project,resolution,resolutiondate,fixVersion',
    );
    // For every single release, get the issues part of the release
    let releaseTickets: any = [];
    for (const release of releaseTicketsRaw) {
      const issues: any = [];
      if (
        release.fields.fixVersions !== undefined &&
        release.fields.fixVersions.length > 0
      ) {
        const issuesJira = await jiraSearchIssues(
          userConfig.jira,
          `fixVersion = "${release.fields.fixVersions[0].name}"`,
          '*all,-comments,labels,created,summary,status,issuetype,assignee,project,resolution,resolutiondate',
        );
        for (const issue of issuesJira) {
          if (issue.key !== release.key) {
            issues.push({
              key: issue.key,
              status: issue.fields.status,
            });
          }
        }
      }
      releaseTickets.push({ ...release, issuesInRelease: issues });
    }

    this.log('Getting initiatives from Jira');
    const initiativesSourceTickets = await jiraSearchIssues(
      userConfig.jira,
      userConfig.report.initiatives.jql,
      `*all,comments,labels,created,summary,status,issuetype,assignee,project,resolution,resolutiondate,${userConfig.jira.fields.deliveryConfidence},${userConfig.jira.fields.expectedDelivery}`,
    );

    const teams = getStreamsCachePerTeam(userConfig, cacheDir);

    const initiatives = getInitiatives(
      teams,
      initiativesSourceTickets,
      userConfig,
    );

    // Begin by generating a report object
    // This report will then be used to create the markdown
    const deliveryReportSrc: any = {
      date: new Date(),
      teams: teams.filter(t =>
        userConfig.report.distributionTeams.includes(t.name),
      ),
      releaseTickets,
      initiatives,
    };

    const reportName = `Delivery report for week: ${format(
      deliveryReportSrc.date,
      'yyyy-ww',
    )}`;
    let deliveryReport = `# ${reportName} \n`;
    deliveryReport += `<sub>🕟 Report generated on: ${format(
      deliveryReportSrc.date,
      'LLLL dd, yyyy HH:mm',
    )}. Initiatives listed in this report are [fetched from Jira](${encodeURI(
      `${userConfig.jira.host}/issues/?jql=${userConfig.report.initiatives.jql}`,
    )}). </sub> \n`;
    deliveryReport += `## Overview \n`;
    deliveryReport += `### Effort distribution \n`;
    deliveryReport += createDistributionTable(
      deliveryReportSrc.teams,
      userConfig,
    );
    deliveryReport += `\n`;
    deliveryReport += `### Releases pipeline \n`;
    deliveryReport += createReleasePipelineTable(
      deliveryReportSrc.releaseTickets,
      userConfig,
    );
    deliveryReport += `\n`;
    deliveryReport += `### Initiatives overview \n`;
    deliveryReport += createInitiativesOverviewTable(
      deliveryReportSrc.initiatives,
      userConfig,
    );
    deliveryReport += `# Initiatives Details \n`;
    for (const i of deliveryReportSrc.initiatives) {
      deliveryReport += createInitiativeDetails(i, userConfig);
      deliveryReport += `---\n`;
    }
    deliveryReport += `\n`;
    deliveryReport += `<sub>ℹ️ You can hide comments from the report by adding #NO-REPORT anywhere in a comment.</sub> \n`;

    deliveryReportSrc.markdown = deliveryReport;

    if (flags.save) {
      // Saving the report to file
      const reportsCache = path.join(cacheDir, `delivery-reports/`);
      fs.mkdirSync(reportsCache, { recursive: true });
      const cacheFilename = `${format(new Date(), 'yyyy-ww')}.json`;
      this.log(
        `Saving report to cache file: ${path.join(
          reportsCache,
          cacheFilename,
        )}`,
      );
      const fileStream = fs.createWriteStream(
        path.join(reportsCache, cacheFilename),
        { flags: 'w' },
      );
      fileStream.write(JSON.stringify(deliveryReportSrc));
      fileStream.end();

      // Create/Update report issue in GitHub
      const octokit = new Octokit({ auth: userConfig.report.github.token });
      const issues = await octokit.paginate(
        `GET /repos/{owner}/{repo}/issues?labels=${userConfig.report.github.label}`,
        {
          owner: userConfig.report.github.owner,
          repo: userConfig.report.github.repository,
          state: 'all',
          per_page: 100,
        },
      );

      // Search for an issue with the same title
      // If present it will be updated, if absent it will be created.
      const existingReportIssue: any = issues.find(
        (i: any) => i.title === reportName,
      );
      if (existingReportIssue === undefined || existingReportIssue === null) {
        // Create Issue
        await octokit.request('POST /repos/{owner}/{repo}/issues', {
          owner: userConfig.report.github.owner,
          repo: userConfig.report.github.repository,
          title: reportName,
          body: deliveryReport,
          labels: [userConfig.report.github.label],
        });
      } else if (existingReportIssue.state === 'open') {
        // Update Issue
        await octokit.request(
          'PATCH /repos/{owner}/{repo}/issues/{issue_number}',
          {
            owner: userConfig.report.github.owner,
            repo: userConfig.report.github.repository,
            issue_number: existingReportIssue.number,
            title: reportName,
            body: deliveryReport,
          },
        );
        this.log(
          `Updated GitHub Issue # ${existingReportIssue.number} (${existingReportIssue.html_url})`,
        );
      } else {
        this.log(
          `GitHub Issue # ${existingReportIssue.number} is closed, not updating it (${existingReportIssue.html_url}).`,
        );
      }
    }
  }
}
