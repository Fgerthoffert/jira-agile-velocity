import { flags } from '@oclif/command';
import * as fs from 'fs';
import * as path from 'path';

import Command from '../base';
import getCompletion from '../utils/streams/getCompletion';
import { getTeamId } from '../utils/misc/teamUtils';
import jiraSearchIssues from '../utils/jira/searchIssues';

import { getChildrenKey } from '../utils/streams/getChildren';
import { getId } from '../utils/misc/id';

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

export default class Streams extends Command {
  static description = 'Fetches Completion and Forecast streams per team';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    useCache: flags.boolean({
      char: 'c',
      default: false,
      description: 'Use local cache instead of fetching the data from Jira',
    }),
  };

  async run() {
    const { flags } = this.parse(Streams);
    const userConfig = this.userConfig;
    const cacheDir = path.join(this.config.configDir, 'cache');
    /*
    Implementation Specs:
    - Streams content are exclusive in the order of definition in the config file. 
    A tickets already accounted for completion in stream A, will not be counted towards stream B

    */

    for (const team of userConfig.teams) {
      this.log(`Fetching queries for team: ${team.name}`);

      const fetchedIssues: Array<string> = [];
      const completedStreams: Array<any> = [];
      for (const stream of team.streams) {
        this.log(`Processing stream: ${stream.name}`);

        let childIssues: Array<string> = [];
        if (stream.completion.childOf !== undefined) {
          this.log(
            `${team.name}/${stream.name}: Collecting children using JQL: ${stream.completion.childOf}`,
          );
          // Get list of issue keys matching the JQL query
          childIssues = await getChildrenKey(
            userConfig.jira,
            stream.completion.childOf,
            cacheDir,
            flags.useCache,
          );
        }

        const completionDays = await getCompletion(
          team,
          userConfig.jira,
          stream,
          cacheDir,
          fetchedIssues,
          childIssues,
        );

        // This records issues that were already accounted for completion
        // in preview streams for the team
        for (const d of completionDays) {
          for (const i of d.issues) {
            fetchedIssues.push(i);
          }
        }

        completedStreams.push({
          key: getId(stream.name),
          name: stream.name,
          jql: stream.completion.jql,
          childOf:
            stream.completion.childOf === undefined
              ? null
              : stream.completion.childOf,
          days: completionDays.map((d: any) => {
            return {
              ...d,
              issues: d.issues.map((i: any) => trimIssue(i)),
            };
          }),
          childIssues,
        });
      }

      this.log(
        `Team: ${team.name} Fetched data for ${completedStreams.length} streams`,
      );

      const teamData = {
        name: team.name,
        from: team.from,
        excludeDays: team.excludeDays,
        jiraHost: userConfig.jira.host,
        completion: completedStreams,
        updatedAt: new Date().toJSON(),
      };

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

      this.log('------------');
    }
  }
}
