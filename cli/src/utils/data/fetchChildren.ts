import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import * as fsNdjson from 'fs-ndjson';

import { IConfig } from '../../global';
import jiraSearchIssues from '../jira/searchIssues';
import { cleanIssue, returnTicketsPoints } from '../misc/jiraUtils';

/*
    Fetches all initiatives
*/
/* eslint max-params: ["error", 5] */
/* eslint-env es6 */
const fetchChildren = async (
  userConfig: IConfig,
  issueKey: string,
  cacheDir: string,
  useCache: boolean,
  toDate?: string | undefined,
) => {
  cli.action.start('Fetching children of: ' + issueKey);
  let issues: any = [];
  // If cache is enabled we don't fetch initiatives twice on the same day
  let today = new Date();
  if (toDate !== undefined) {
    today = new Date(toDate);
  }
  const childrenCache = path.join(
    cacheDir,
    'roadmap-childcache-' +
      issueKey +
      '-' +
      today.toJSON().slice(0, 10) +
      '.ndjson',
  );

  if (useCache && fs.existsSync(childrenCache)) {
    issues = fsNdjson.readFileSync(childrenCache);
    // eslint-disable-next-line no-negated-condition
  } else if (toDate !== undefined) {
    issues = [];
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
        userConfig.jira.fields.parentEpic,
    );
    const issueFileStream = fs.createWriteStream(childrenCache, {
      flags: 'w',
    });
    for (const issue of issuesJira) {
      const updatedIssue = {
        ...issue,
        host: userConfig.jira.host,
        // jql: 'issuekey in childIssuesOf(' + issueKey + ')',
        points: returnTicketsPoints(issue, userConfig),
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
