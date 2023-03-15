/* eslint max-depth: ["error", 7] */
/* eslint max-params: ["error", 7] */
/* eslint-env es6 */

import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import * as fsNdjson from 'fs-ndjson';

import { IJiraIssue, UserConfigTeam, UserConfigJira } from '../../global';
import jiraSearchIssues from '../jira/searchIssues';
import { formatDate, getDaysBetweenDates } from '../misc/dateUtils';
import { differenceInDays, startOfDay } from 'date-fns';
import { getTeamId } from '../misc/teamUtils';
import { getId } from '../misc/id';
import { returnTicketsPoints } from '../misc/jiraUtils';

/*
    Fetches all completed issues, per day from a team
*/
const getCompletion = async (
  team: UserConfigTeam,
  jiraConfig: UserConfigJira,
  stream: any,
  cacheDir: string,
  fetchedIssues: Array<string> = [], // Array of issues that were already fetched by previous streams
  onlyIssues: Array<string> = [], // Only account for issues with key present in this array
  toDate?: string | undefined,
) => {
  cli.log('Fetching completed issues for stream: ' + stream.name);

  const excludeDays =
    team.excludeDays === undefined
      ? jiraConfig.excludeDays
      : [...jiraConfig.excludeDays, ...team.excludeDays];
  let toDay = new Date();
  toDay.setDate(toDay.getDate() - 1);
  if (toDate !== undefined) {
    toDay = new Date(toDate);
  }

  cli.log(
    `Not fetching daily completion for days: ${JSON.stringify(
      excludeDays,
    )} as per configuration`,
  );

  const dates = getDaysBetweenDates(formatDate(team.from), toDay);

  const queryIssues: any = [];
  for (const scanDay of dates.filter(
    (d: any) => !excludeDays.includes(d.date.toJSON().slice(0, 10)),
  )) {
    let issues: Array<IJiraIssue> = [];

    const issuesDayFilepath = path.join(
      cacheDir,
      getTeamId(team.name),
      `completed-${getId(stream.name)}-${scanDay.date
        .toJSON()
        .slice(0, 10)}.ndjson`,
    );

    // Create folder to be used to store the team's cache
    fs.mkdirSync(path.join(cacheDir, getTeamId(team.name)), {
      recursive: true,
    });

    // If a file is marked clear, it gets deleted
    // .clear file are simply used by the UI to know how many files are pending data refresh
    // And therefore avoid having a very large number of deletion requests triggered at once from the UI
    if (fs.existsSync(issuesDayFilepath + '.clear')) {
      fs.unlinkSync(issuesDayFilepath + '.clear');
    }
    // eslint-disable-next-line no-negated-condition
    if (!fs.existsSync(issuesDayFilepath)) {
      cli.action.start(
        'Fetching data for day: ' +
          scanDay.date.toJSON().slice(0, 10) +
          ' to file: ' +
          issuesDayFilepath,
      );
      const issuesJira = await jiraSearchIssues(
        jiraConfig,
        stream.completion.jql.replace(
          '##TRANSITION_DATE##',
          scanDay.date.toJSON().slice(0, 10),
        ),
        'labels,created,summary,status,issuetype,assignee,resolution,priority,' +
          jiraConfig.fields.points +
          ',' +
          jiraConfig.fields.originalPoints,
      );

      // console.log(issuesJira);
      const uniqueIssuesJira = [];
      for (const i of issuesJira) {
        if (!fetchedIssues.includes(i.key)) {
          if (onlyIssues.length > 0 && onlyIssues.includes(i.key)) {
            fetchedIssues.push(i.key);
            uniqueIssuesJira.push(i);
          } else if (onlyIssues.length === 0) {
            fetchedIssues.push(i.key);
            uniqueIssuesJira.push(i);
          }
        }
      }

      // console.log(uniqueIssuesJira);

      // Note: We'd still write an empty file to cache to record the fact that no issues were completed that day
      const issueFileStream = fs.createWriteStream(issuesDayFilepath, {
        flags: 'a',
      });
      if (uniqueIssuesJira.length > 0) {
        for (const issue of uniqueIssuesJira) {
          // Adding a closedAt object to record the date at which the issue was actually closed
          // Attaching points directly to the issues object to avoid having to bring jira-field config specific elements to the UI
          const openedForDays = differenceInDays(
            new Date(scanDay.date),
            new Date(issue.fields.created),
          );
          const updatedIssue = {
            ...issue,
            closedAt: new Date(scanDay.date).toISOString(),
            openedForDays: openedForDays < 0 ? 0 : openedForDays,
            points: returnTicketsPoints(issue, jiraConfig),
          };

          // In some occurences, an issue might already be present (if it was re-open for example)
          // We filter out any occurence of this issue already be present
          // This way we only keep the most recent time a ticket is closed and we avoid duplicates.
          issues = issues.filter((i: any) => i.key !== updatedIssue.key);

          issues.push(updatedIssue);
          issueFileStream.write(JSON.stringify(updatedIssue) + '\n');
        }
      }
      issueFileStream.end();
      cli.action.stop(' done');
    } else {
      const cachedIssues = fsNdjson.readFileSync(issuesDayFilepath);
      for (const issue of cachedIssues) {
        // In some occurences, an issue might already be present (if it was re-open for example)
        // We filter out any occurence of this issue already be present
        // This way we only keep the most recent time a ticket is closed and we avoid duplicates.
        issues = issues.filter((i: any) => i.key !== issue.key);
        issues.push(issue);
      }
    }

    queryIssues.push({
      day: startOfDay(new Date(scanDay.date)).toISOString(),
      issues: issues,
    });
  }
  // Done with processing all days for that particular query
  cli.log(
    `Team: ${team.name}, Query: ${stream.completion.jql}, Number of days: ${queryIssues.length}`,
  );

  return queryIssues;
};

export default getCompletion;
