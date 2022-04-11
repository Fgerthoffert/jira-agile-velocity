import { flags } from '@oclif/command';
import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';

import Command from '../base';
import { ICalendar, ICalendarFinal, IConfig } from '../global';
import fetchCompleted from '../utils/data/fetchCompleted';
import jiraSearchIssues from '../utils/jira/searchIssues';
import { getTeamId } from '../utils/misc/teamUtils';
import getDailyHealthMsg from '../utils/slack/getDailyHealthMsg';
import sendSlackMsg from '../utils/slack/sendSlackMsg';
import initCalendar from '../utils/velocity/initCalendar';
import insertClosed from '../utils/velocity/insertClosed';
import insertDailyVelocity from '../utils/velocity/insertDailyVelocity';
import insertForecast from '../utils/velocity/insertForecast';
import insertHealth from '../utils/velocity/insertHealth';
import insertOpen from '../utils/velocity/insertOpen';
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
    const { flags } = this.parse(Velocity);
    const userConfig = this.userConfig;

    for (const team of userConfig.teams) {
      const completionQueries = await fetchCompleted(
        team,
        userConfig.jira,
        this.config.configDir + '/cache/',
      );
      console.log(`Team: ${team.name} Fetched ${completionQueries.map(q => q.issues.length).reduce((sum, x) => sum + x)} completed issues`);

      const teamData = {
        ...team,
        completion: [],
        updatedAt: new Date().toJSON(),
      }

      const emptyCalendar: ICalendar = initCalendar(team.from);
      for (const q of completionQueries) {
        const calendarWithClosed = await insertClosed(
          emptyCalendar,
          q.issues,
        );

        const calendarVelocity: ICalendarFinal = {
          ...q,
          ...calendarWithClosed,
          days: insertDailyVelocity(calendarWithClosed),
          weeks: insertWeeklyVelocity(calendarWithClosed),
          updatedAt: new Date().toJSON(), // Adding updated date to the payload
          host: userConfig.jira.host, // Adding Jira host config
        };

        const trimmedPayload = {
          ...calendarVelocity,
          days: calendarVelocity.days.map((d: any) => {
            if (d.completion.list !== undefined) {
              d.completion.list = d.completion.list.map((i: any) => i.key);
              // delete d.completion.list;
            }
            if (d.scopeChangeCompletion.list !== undefined) {
              d.scopeChangeCompletion.list = d.scopeChangeCompletion.list.map(
                (i: any) => i.key,
              );
              // delete d.scopeChangeCompletion.list;
            }
            return d;
          }),
          weeks: calendarVelocity.weeks.map((w: any) => {
            if (w.completion.list !== undefined) {
              w.completion.list = w.completion.list.map((i: any) => i.key);
              // delete w.completion.list;
            }
            if (w.scopeChangeCompletion.list !== undefined) {
              w.scopeChangeCompletion.list = w.scopeChangeCompletion.list.map(
                (i: any) => i.key,
              );
              // delete w.scopeChangeCompletion.list;
            }
            return w;
          }),
          issues: calendarVelocity.issues.map((i: any) => i.key),
        };
        teamData.completion.push(trimmedPayload)
      }

      const cacheDir = this.config.configDir + '/cache/';
      const issueFileStream = fs.createWriteStream(
        path.join(
          cacheDir,
          'velocity-artifacts-' + getTeamId(team.name) + '.json',
        ),
        { flags: 'w' },
      );
      issueFileStream.write(JSON.stringify(teamData));
      issueFileStream.end();   
      console.log('-----')
    }
  }
}
