import { flags } from '@oclif/command';
import * as fs from 'fs';
import * as path from 'path';

import Command from '../base';
import fetchCompleted from '../utils/data/fetchCompleted';
import { getTeamId } from '../utils/misc/teamUtils';

const trimIssue = (issue: any) => {
  return {
    key: issue.key,
    closedAt: issue.closedAt,
    points: issue.points,
    openedForBusinessDays: issue.openedForBusinessDays,
    fields: {
      summary: issue.fields.summary,
      created: issue.fields.created,
    },
  };
};

export default class Completion extends Command {
  static description = 'Records issue completion based on defined JQL queries';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const { flags } = this.parse(Completion);
    const userConfig = this.userConfig;

    for (const team of userConfig.teams) {
      const completionQueries = await fetchCompleted(
        team,
        userConfig.jira,
        this.config.configDir + '/cache/',
      );

      // Trim the dataset to avoid sending too much data to the frontend
      const trimmedCompletionQueries = completionQueries.map((q: any) => {
        return {
          ...q,
          days: q.days.map((d: any) => {
            return {
              ...d,
              issues: d.issues.map((i: any) => trimIssue(i)),
            };
          }),
        };
      });

      console.log(
        `Team: ${team.name} Fetched data from ${trimmedCompletionQueries.length}`,
      );

      const teamData = {
        name: team.name,
        from: team.from,
        excludeDays: team.excludeDays,
        jiraHost: userConfig.jira.host,
        completion: trimmedCompletionQueries,
        updatedAt: new Date().toJSON(),
      };

      const cacheDir = this.config.configDir + '/cache/';
      const issueFileStream = fs.createWriteStream(
        path.join(
          cacheDir,
          'completion-artifacts-' + getTeamId(team.name) + '.json',
        ),
        { flags: 'w' },
      );
      issueFileStream.write(JSON.stringify(teamData));
      issueFileStream.end();
      console.log('-----');
    }
  }
}
