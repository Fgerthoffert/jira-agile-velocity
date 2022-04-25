import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import * as fsNdjson from 'fs-ndjson';

import { IConfig, IConfigJira, IConfigTeam } from '../../global';
import jiraSearchIssues from '../jira/searchIssues';
import { getTeamFromAssignee } from '../misc/teamUtils';
import { cleanIssue, returnTicketsPoints } from '../misc/jiraUtils';
import { getId } from '../../utils/misc/id';

/*
    Fetches all issues and potentially their children
*/
const fetchInitiatives = async (
  jql: string,
  teamName: string,
  categoryName: string,
  jiraConfig: IConfigJira,
  cacheDir: string,
  useCache: boolean,
  toDate?: string | undefined,
) => {
  cli.action.start(`Fetching issues using JQL query: ${jql}`);
  let issues: any = [];
  // If cache is enabled we don't fetch initiatives twice on the same day
  let today = new Date();
  if (toDate !== undefined) {
    today = new Date(toDate);
  }
  const initiativesCache = path.join(
    cacheDir,
    `forecast-${getId(teamName)}-${getId(
      categoryName,
    )}-' + today.toJSON().slice(0, 10) + '.ndjson`,
  );

  if (useCache && fs.existsSync(initiativesCache)) {
    issues = fsNdjson.readFileSync(initiativesCache);
    // eslint-disable-next-line no-negated-condition
  } else if (toDate !== undefined) {
    issues = [];
  } else {
    const issuesJira = await jiraSearchIssues(
      jiraConfig,
      jql,
      'summary,status,' +
        jiraConfig.fields.points +
        ',' +
        jiraConfig.fields.originalPoints +
        ',issuetype,assignee',
    );
    const issueFileStream = fs.createWriteStream(initiativesCache, {
      flags: 'w',
    });
    for (const issue of issuesJira) {
      const updatedIssue = {
        ...issue,
        host: jiraConfig.host,
        jql: jql,
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

export default fetchInitiatives;
