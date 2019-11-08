// tslint:disable-next-line: file-name-casing
import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import * as fsNdjson from 'fs-ndjson';

import { IConfig } from '../../global';
import jiraSearchIssues from '../jira/searchIssues';
import { getTeamFromAssignee } from '../misc/teamUtils';
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
const fetchInitiatives = async (
  userConfig: IConfig,
  cacheDir: string,
  useCache: boolean,
) => {
  cli.action.start(
    'Fetching roadmap initiatives using: ' +
      userConfig.roadmap.jqlInitiatives +
      ' ',
  );
  let issues: any = [];
  // If cache is enabled we don't fetch initiatives twice on the same day
  const today = new Date();
  const initiativesCache = path.join(
    cacheDir,
    'roadmap-initiatives-' + today.toJSON().slice(0, 10) + '.ndjson',
  );

  if (useCache && fs.existsSync(initiativesCache)) {
    issues = fsNdjson.readFileSync(initiativesCache);
  } else {
    const issuesJira = await jiraSearchIssues(
      userConfig.jira,
      userConfig.roadmap.jqlInitiatives,
      'summary,status,' +
        userConfig.jira.fields.points +
        ',' +
        userConfig.jira.fields.originalPoints +
        ',issuetype,assignee',
    );
    const issueFileStream = fs.createWriteStream(initiativesCache, {
      flags: 'w',
    });
    for (const issue of issuesJira) {
      const updatedIssue = {
        ...issue,
        host: userConfig.jira.host,
        jql: userConfig.roadmap.jqlInitiatives,
        team: getTeamFromAssignee(issue, userConfig.roadmap.teams),
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

export default fetchInitiatives;
