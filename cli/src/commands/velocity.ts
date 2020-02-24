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
    type: flags.string({
      char: 't',
      description: 'Send slack update using issues or points',
      options: ['issues', 'points'],
      default: 'points',
    }),
    dryrun: flags.boolean({
      char: 'd',
      default: false,
      description: 'Dry-Run, do not send slack message',
    }),
  };

  async run() {
    const { flags } = this.parse(Velocity);
    const userConfig = this.userConfig;

    const { type, dryrun } = flags;
    for (const team of userConfig.teams) {
      const closedIssues = await fetchCompleted(
        userConfig,
        this.config.configDir + '/cache/',
        team.name,
      );
      console.log('Fetched ' + closedIssues.length + ' completed issues');

      const emptyCalendar: ICalendar = initCalendar(team.jqlHistory);
      const calendarWithClosed = await insertClosed(
        emptyCalendar,
        closedIssues,
      );

      const openIssues = await this.fetchOpenIssues(userConfig, team.name);
      const calendarWithOpen = insertOpen(calendarWithClosed, openIssues);

      const calendarVelocity: ICalendarFinal = {
        ...calendarWithOpen,
        days: insertDailyVelocity(calendarWithOpen),
        weeks: insertWeeklyVelocity(calendarWithOpen),
      };

      const calendarWithForecast = insertForecast(calendarVelocity);
      const calendarWithHealth = {
        ...insertHealth(calendarWithForecast),
        updatedAt: new Date().toJSON(), // Adding updated date to the payload
        host: userConfig.jira.host, // Adding Jira host config
        jqlCompletion: team.jqlCompletion, // Adding JQL completion query
      };

      // Prune issues list from the object
      const trimmedPayload = {
        ...calendarWithHealth,
        days: calendarWithHealth.days.map((d: any) => {
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
        weeks: calendarWithHealth.weeks.map((w: any) => {
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
        open: (o: any) => {
          if (o.list !== undefined) {
            o.list = o.list.map((i: any) => i.key);
            // delete o.list;
          }
          return o;
        },
      };

      const slackMsg = getDailyHealthMsg(
        trimmedPayload,
        type,
        userConfig,
        team.name,
      );
      this.log(slackMsg);

      if (!dryrun) {
        cli.action.start('Sending message to Slack');
        sendSlackMsg(team.slack.token, team.slack.channel, slackMsg);
        cli.action.stop(' done');
      }

      const cacheDir = this.config.configDir + '/cache/';
      const issueFileStream = fs.createWriteStream(
        path.join(
          cacheDir,
          'velocity-artifacts-' + getTeamId(team.name) + '.json',
        ),
        { flags: 'w' },
      );
      issueFileStream.write(JSON.stringify(trimmedPayload));
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
