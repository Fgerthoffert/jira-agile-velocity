// tslint:disable-next-line: file-name-casing
import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import * as fsNdjson from 'fs-ndjson';

import { IConfig, IJiraIssue } from '../../global';
import jiraSearchIssues from '../jira/searchIssues';
import { formatDate, getDaysBetweenDates } from '../misc/dateUtils';
import { getTeamId } from '../misc/teamUtils';

const returnTicketsPoints = (issue: any, config: IConfig) => {
  if (
    issue.fields[config.jira.fields.points] !== undefined &&
    issue.fields[config.jira.fields.points] !== null
  ) {
    return issue.fields[config.jira.fields.points];
  }
  if (
    issue.fields[config.jira.fields.originalPoints] !== undefined &&
    issue.fields[config.jira.fields.originalPoints] !== null
  ) {
    return issue.fields[config.jira.fields.originalPoints];
  }
  return 0;
};

/*
    Fetches all completed issues, per day from a team
*/
const fetchCompleted = async (
  config: IConfig,
  cacheDir: string,
  teamName: string,
) => {
  let issues: Array<IJiraIssue> = [];
  console.log('Fetching data for team: ' + teamName);
  const teamConfig = config.teams.find(t => t.name === teamName);
  if (teamConfig !== undefined) {
    const excludeDays =
      teamConfig.excludeDays !== undefined
        ? [...config.jira.excludeDays, ...teamConfig.excludeDays]
        : config.jira.excludeDays;
    const toDay = new Date();
    toDay.setDate(toDay.getDate() - 1);
    const dates = getDaysBetweenDates(formatDate(teamConfig.jqlHistory), toDay);
    for (const scanDay of dates) {
      if (
        excludeDays.find(
          (day: string) => day === scanDay.date.toJSON().slice(0, 10),
        ) === undefined
      ) {
        const issuesDayFilepath = path.join(
          cacheDir,
          'completed-' +
            getTeamId(teamName) +
            '-' +
            scanDay.date.toJSON().slice(0, 10) +
            '.ndjson',
        );
        // If a file is marked clear, it gets deleted
        // .clear file are simply used by the UI to know how many files are pending data refresh
        // And therefore avoid having a very large number of deletion requests triggered at once from the UI
        if (fs.existsSync(issuesDayFilepath + '.clear')) {
          fs.unlinkSync(issuesDayFilepath + '.clear');
        }
        if (!fs.existsSync(issuesDayFilepath)) {
          cli.action.start(
            'Fetching data for day: ' +
              scanDay.date.toJSON().slice(0, 10) +
              ' to file: ' +
              issuesDayFilepath,
          );

          const jqlQuery =
            teamConfig.jqlCompletion +
            ' ON(' +
            scanDay.date.toJSON().slice(0, 10) +
            ')';
          const issuesJira = await jiraSearchIssues(
            config.jira,
            jqlQuery,
            'labels,summary,status,issuetype,assignee,' +
              config.jira.fields.points +
              ',' +
              config.jira.fields.originalPoints,
          );
          //Note: We'd still write an empty file to cache to record the fact that no issues were completed that day
          const issueFileStream = fs.createWriteStream(issuesDayFilepath, {
            flags: 'a',
          });
          if (issuesJira.length > 0) {
            for (const issue of issuesJira) {
              // Adding a closedAt object to record the date at which the issue was actually closed
              // Attaching points directly to the issues object to avoid having to bring jira-field config specific elements to the UI
              const updatedIssue = {
                ...issue,
                closedAt: scanDay.date.toJSON().slice(0, 10),
                weekStart: scanDay.weekStart.toJSON(),
                weekTxt: scanDay.weekTxt,
                team: teamName,
                //              host: config.jira.host,
                points: returnTicketsPoints(issue, config),
                //              jql: jqlQuery
              };

              issues.push(updatedIssue);
              issueFileStream.write(JSON.stringify(updatedIssue) + '\n');
            }
          }
          issueFileStream.end();
          cli.action.stop(' done');
        } else {
          issues = [...issues, ...fsNdjson.readFileSync(issuesDayFilepath)];
        }
      } else {
        cli.log(
          'Not fetching daily completion for day: ' +
            scanDay.date.toJSON().slice(0, 10) +
            ' as per configuration',
        );
      }
    }
  }
  return issues;
};

export default fetchCompleted;
