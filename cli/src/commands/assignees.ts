import { flags } from '@oclif/command';
import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';

import Command from '../base';
import { ICalendar, IConfig } from '../global';
import fetchCompleted from '../utils/data/fetchCompleted';
import jiraSearchIssues from '../utils/jira/searchIssues';
import { getTeamId } from '../utils/misc/teamUtils';
import initCalendar from '../utils/velocity/initCalendar';
import insertClosed from '../utils/velocity/insertClosed';
import insertWeeklyVelocity from '../utils/velocity/insertWeeklyVelocity';
import { cleanIssue } from '../utils/misc/jiraUtils';
import { returnTicketsPoints } from '../utils/misc/jiraUtils';

export default class Velocity extends Command {
  static description = 'Builds velocity stats by day and week';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const userConfig = this.userConfig;

    for (const team of userConfig.teams) {
      const closedIssues = await fetchCompleted(
        userConfig,
        this.config.configDir + '/cache/',
        team.name,
      );
      console.log('Fetched ' + closedIssues.length + ' completed issues');

      const emptyCalendar: ICalendar = initCalendar(team.jqlHistory);

      // Extract an array of assignees from the closed issues
      const assignees = closedIssues.reduce((acc: Array<string>, i) => {
        if (i.fields.assignee !== undefined) {
          if (i.fields.assignee === null && !acc.includes('EMPTY')) {
            acc.push('EMPTY')
          } else if (i.fields.assignee !== null && !acc.includes(i.fields.assignee.name)) {
            acc.push(i.fields.assignee.name)
          }
        }
        return acc
      }, [])
      assignees.push('ALL')



      const assigneesVelocity = assignees.map((a: string) => {
        const assigneesClosedIssues = closedIssues.filter((i) => {
          if (a === 'ALL') {
            return true;
          }
          if (a === 'EMPTY' && (i.fields.assignee === undefined || i.fields.assignee === null)) {
            return true;
          }
          if (i.fields.assignee !== undefined && i.fields.assignee !== null && i.fields.assignee.name === a) {
            return true;
          }
          return false;
        })
        const calendarWithClosed = insertClosed(
          emptyCalendar,
          assigneesClosedIssues,
        )
        const weeklyVelocity = insertWeeklyVelocity(calendarWithClosed)
        const trimmedWeeks = weeklyVelocity.map((w: any) => {
          if (w.completion.list !== undefined) {
            w.completion.list = w.completion.list.map((i: any) => {
              return {
                key: i.key,
                points: i.points
              }
            });
          }
          delete w.scopeChangeCompletion
          return w
        })
        return {
          name: a,
          // closedIssues: calendarWithClosed,
          weeks: trimmedWeeks,
        }
      })

      const calendarVelocity: any = {
        assignees,
        velocity: assigneesVelocity,
        updatedAt: new Date().toJSON(), // Adding updated date to the payload
        host: userConfig.jira.host, // Adding Jira host config
        jqlCompletion: team.jqlCompletion, // Adding JQL completion query
      };

      const cacheDir = this.config.configDir + '/cache/';
      const issueFileStream = fs.createWriteStream(
        path.join(
          cacheDir,
          'assignees-artifacts-' + getTeamId(team.name) + '.json',
        ),
        { flags: 'w' },
      );
      issueFileStream.write(JSON.stringify(calendarVelocity));
      issueFileStream.end();   
    }
  }

  /*
    Fetch open issues from Jira
  */
  fetchOpenIssues = async (userConfig: IConfig, teamName: string) => {
    const teamConfig = userConfig.teams.find(t => t.name === teamName);
    if (teamConfig !== undefined) {
      const openIssues = [];
      cli.action.start(
        'Fetching open issues for team: ' +
          teamName +
          ' using JQL: ' +
          teamConfig.jqlRemaining +
          ' ',
      );
      const issuesJira = await jiraSearchIssues(
        userConfig.jira,
        teamConfig.jqlRemaining,
        'labels,' + userConfig.jira.fields.points,
      );
      for (let issue of issuesJira) {
        issue = { ...issue, points: returnTicketsPoints(issue, userConfig) };
        openIssues.push(cleanIssue(issue));
      }
      cli.action.stop(' done');
      return issuesJira;
    }
    return [];
  };
}

export const formatDate = (dateString: string) => {
  const day = new Date(dateString);
  day.setUTCHours(12);
  day.setUTCMinutes(0);
  day.setUTCSeconds(0);
  return day;
};
