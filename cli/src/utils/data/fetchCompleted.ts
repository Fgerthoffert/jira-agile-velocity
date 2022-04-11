/* eslint max-depth: ["error", 7] */
/* eslint-env es6 */

import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import * as fsNdjson from 'fs-ndjson';

import { IConfig, IJiraIssue, IConfigTeam, IConfigJira } from '../../global';
import jiraSearchIssues from '../jira/searchIssues';
import { formatDate, getDaysBetweenDates } from '../misc/dateUtils';
import { differenceInBusinessDays } from 'date-fns'
import { getTeamId } from '../misc/teamUtils';
import { getId } from '../misc/id';
import { returnTicketsPoints } from '../misc/jiraUtils';
import { cy } from 'date-fns/locale';

/*
    Fetches all completed issues, per day from a team
*/
const fetchCompleted = async (
  team: IConfigTeam,
  jiraConfig: IConfigJira,
  cacheDir: string,
  toDate?: string | undefined,
) => {
  const completion: Array<any> = [];
  console.log('Fetching data for team: ' + team.name);

  const excludeDays =
    team.excludeDays === undefined
      ? jiraConfig.excludeDays
      : [...jiraConfig.excludeDays, ...team.excludeDays];
  let toDay = new Date();
  toDay.setDate(toDay.getDate() - 1);
  if (toDate !== undefined) {
    toDay = new Date(toDate);
  }

  cli.log(`Not fetching daily completion for days: ${JSON.stringify(excludeDays)} as per configuration`);

  const dates = getDaysBetweenDates(formatDate(team.from), toDay);

  const jqlQueries = [
    { key: 'all', jql: team.completion.all },
    ...team.completion.categories.map((c) => {
      return {
        ...c,
        key: getId(c.name),
      }
    })
  ]

  cli.log(`The following JQL queries will be fetched:`)
  for (const q  of jqlQueries) {
    cli.log(`Key: ${q.key}, JQL: ${q.jql}`)
  }

  for (const q of jqlQueries) {
    let issues: Array<IJiraIssue> = [];
    for (const scanDay of dates.filter((d: any) => !excludeDays.includes(d.date.toJSON().slice(0, 10)))) {
      const issuesDayFilepath = path.join(
        cacheDir,
        getTeamId(team.name),
        `completed-${q.key}-${scanDay.date.toJSON().slice(0, 10)}.ndjson`
      )

      // Create folder to be used to store the team's cache
      fs.mkdirSync(path.join(cacheDir, getTeamId(team.name)), { recursive: true })

      // If a file is marked clear, it gets deleted
      // .clear file are simply used by the UI to know how many files are pending data refresh
      // And therefore avoid having a very large number of deletion requests triggered at once from the UI
      if (fs.existsSync(issuesDayFilepath + '.clear')) {
        fs.unlinkSync(issuesDayFilepath + '.clear')
      }
      // eslint-disable-next-line no-negated-condition
      if (!fs.existsSync(issuesDayFilepath)) {
        cli.action.start(
          'Fetching data for day: ' +
            scanDay.date.toJSON().slice(0, 10) +
            ' to file: ' +
            issuesDayFilepath,
        )
        const issuesJira = await jiraSearchIssues(
          jiraConfig,
          q.jql.replace('##TRANSITION_DATE##', scanDay.date.toJSON().slice(0, 10)),
          'labels,created,summary,status,issuetype,assignee,' +
            jiraConfig.fields.points +
            ',' +
            jiraConfig.fields.originalPoints,
        );
        // Note: We'd still write an empty file to cache to record the fact that no issues were completed that day
        const issueFileStream = fs.createWriteStream(issuesDayFilepath, {
          flags: 'a',
        });
        if (issuesJira.length > 0) {
          for (const issue of issuesJira) {
            // Adding a closedAt object to record the date at which the issue was actually closed
            // Attaching points directly to the issues object to avoid having to bring jira-field config specific elements to the UI
            const openedForDays = differenceInBusinessDays(new Date(scanDay.date), new Date(issue.fields.created))
            const updatedIssue = {
              ...issue,
              closedAt: scanDay.date.toJSON().slice(0, 10),
              openedForBusinessDays: openedForDays < 0 ? 0 : openedForDays,
              weekStart: scanDay.weekStart,
              weekEnd: scanDay.weekEnd,
              weekTxt: scanDay.weekTxt,
              team: team.name,
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
    }
    // Done with processing all days for that particular query
    cli.log(`Team: ${team.name}, Query: ${q.key}, Number of issues: ${issues.length}`)
    completion.push({...q, issues: issues})
  }

  return completion;
};

export default fetchCompleted;
