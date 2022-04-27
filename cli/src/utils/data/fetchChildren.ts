import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import * as fsNdjson from 'fs-ndjson';

import { UserConfigJira } from '../../global';
import jiraSearchIssues from '../jira/searchIssues';
import { cleanIssue, returnTicketsPoints } from '../misc/jiraUtils';

/*
    Fetches all initiatives
*/
/* eslint max-params: ["error", 5] */
/* eslint-env es6 */
const fetchChildren = async (
  jiraConfig: UserConfigJira,
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
      jiraConfig,
      'issuekey in childIssuesOf(' + issueKey + ')',
      'summary,status,assignee,' +
        jiraConfig.fields.points +
        ',' +
        jiraConfig.fields.originalPoints +
        ',issuetype,' +
        jiraConfig.fields.parentInitiative +
        ',' +
        jiraConfig.fields.parentEpic,
    );
    const issueFileStream = fs.createWriteStream(childrenCache, {
      flags: 'w',
    });
    for (const issue of issuesJira) {
      const updatedIssue = {
        ...issue,
        host: jiraConfig.host,
        // jql: 'issuekey in childIssuesOf(' + issueKey + ')',
        points: returnTicketsPoints(issue, jiraConfig),
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
