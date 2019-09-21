// tslint:disable-next-line: file-name-casing
import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as stream from 'stream';

import { IConfig, IJiraIssue } from '../../global';
import jiraSearchIssues from '../jira/searchIssues';
import { formatDate, getDaysBetweenDates } from '../misc/dateUtils';
import { getTeamId } from '../misc/teamUtils';

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
  let issues = [];
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
    const input = fs.createReadStream(childrenCache);
    for await (const line of readLines(input)) {
      issues.push(JSON.parse(line));
    }
  } else {
    const issuesJira = await jiraSearchIssues(
      userConfig.jira,
      'issuekey in childIssuesOf(' + issueKey + ')',
      'summary,status,labels,' +
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
    for (let issue of issuesJira) {
      const updatedIssue = {
        ...issue,
        host: userConfig.jira.host,
        jql: 'issuekey in childIssuesOf(' + issueKey + ')',
        points: returnTicketsPoints(issue, userConfig)
      };
      issueFileStream.write(JSON.stringify(updatedIssue) + '\n');
      issues.push(updatedIssue);
    }
    issueFileStream.end();
  }

  cli.action.stop(' done');
  return issues;
};

export default fetchChildren;

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

//https://medium.com/@wietsevenema/node-js-using-for-await-to-read-lines-from-a-file-ead1f4dd8c6f
const readLines = (input: any) => {
  const output = new stream.PassThrough({ objectMode: true });
  const rl = readline.createInterface({ input });
  rl.on('line', line => {
    output.write(line);
  });
  rl.on('close', () => {
    output.push(null);
  });
  return output;
};
