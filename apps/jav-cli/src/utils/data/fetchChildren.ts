// tslint:disable-next-line: file-name-casing
import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import * as fsNdjson from 'fs-ndjson';

import { IConfig } from '../../global';
import jiraSearchIssues from '../jira/searchIssues';
import { cleanIssue } from '../misc/jiraUtils';

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
    Fetches all initiatives
*/
const fetchChildren = async (
  userConfig: IConfig,
  issueKey: string,
  cacheDir: string,
  useCache: boolean
) => {
  cli.action.start('Fetching children of: ' + issueKey);
  let issues: any = [];
  // If cache is enabled we don't fetch initiatives twice on the same day
  const today = new Date();
  const childrenCache = path.join(
    cacheDir,
    'roadmap-childcache-' +
      issueKey +
      '-' +
      today.toJSON().slice(0, 10) +
      '.ndjson'
  );

  if (useCache && fs.existsSync(childrenCache)) {
    issues = [...issues, fsNdjson.readFileSync(childrenCache)];
  } else {
    const issuesJira = await jiraSearchIssues(
      userConfig.jira,
      'issuekey in childIssuesOf(' + issueKey + ')',
      'summary,status,assignee,' +
        userConfig.jira.fields.points +
        ',' +
        userConfig.jira.fields.originalPoints +
        ',issuetype,' +
        userConfig.jira.fields.parentInitiative +
        ',' +
        userConfig.jira.fields.parentEpic
    );
    const issueFileStream = fs.createWriteStream(childrenCache, {
      flags: 'w'
    });
    for (const issue of issuesJira) {
      const updatedIssue = {
        ...issue,
        host: userConfig.jira.host,
        //jql: 'issuekey in childIssuesOf(' + issueKey + ')',
        points: returnTicketsPoints(issue, userConfig)
      };
      issueFileStream.write(JSON.stringify(cleanIssue(updatedIssue)) + '\n');
      issues.push(cleanIssue(updatedIssue));
    }
    issueFileStream.end();
  }

  cli.action.stop(' done');
  return issues;
};

export default fetchChildren;
