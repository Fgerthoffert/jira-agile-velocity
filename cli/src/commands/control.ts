import { flags } from '@oclif/command';
import * as fs from 'fs';
import * as path from 'path';

import Command from '../base';
import { ICalendar, IControlBucket } from '../global';
import fetchCompleted from '../utils/data/fetchCompleted';
import { getTeamId } from '../utils/misc/teamUtils';
import initCalendar from '../utils/velocity/initCalendar';
import insertClosed from '../utils/velocity/insertClosed';
import insertControlData from '../utils/velocity/insertControlData';

export default class Control extends Command {
  static description = 'Builds Control stats by week (how long issues were opened for)';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const userConfig = this.userConfig;

    const controlBuckets: Array<IControlBucket> = [{
      key: '0_1',
      value: '1 day',
      color: '#f2929a',
      isInBucket: (value: number) => {return value <= 1},
    }, {
      key: '2_5',
      value: '1 week',
      color: '#f2aea9',
      isInBucket: (value: number) => {return value > 1 && value <= 5},
    }, {
      key: '6_10',
      value: '2 weeks',
      color: '#f1d0b7',
      isInBucket: (value: number) => {return value > 5 && value <= 10},
    }, {
      key: '11_20',
      value: '1 month',
      color: '#d6e4c1',
      isInBucket: (value: number) => {return value > 10 && value <= 20},
    }, {
      key: '21_40',
      value: '2 months',
      color: '#abdecc',
      isInBucket: (value: number) => {return value > 20 && value <= 40},
    }, {
      key: '41+',
      value: 'more',
      color: '#bcc4de',
      isInBucket: (value: number) => {return value > 40},
    }];

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

      const calendarVelocity: any = {
        updatedAt: new Date().toJSON(), // Adding updated date to the payload
        host: userConfig.jira.host, // Adding Jira host config
        jqlCompletion: team.jqlCompletion, // Adding JQL completion query,
        buckets: controlBuckets,
        weeks: insertControlData(calendarWithClosed, controlBuckets),
      };

      // Prune issues list from the object
      const trimmedPayload = {
        ...calendarVelocity,
        weeks: calendarVelocity.weeks.map((w: any) => {
          if (w.completion.list !== undefined) {
            w.completion.list = w.completion.list.map((i: any) => i.key);
            // delete w.completion.list;
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

      const cacheDir = this.config.configDir + '/cache/';
      const controlFileStream = fs.createWriteStream(
        path.join(
          cacheDir,
          'control-artifacts-' + getTeamId(team.name) + '.json',
        ),
        { flags: 'w' },
      );
      controlFileStream.write(JSON.stringify(trimmedPayload));
      controlFileStream.end();
    }
  }

}

export const formatDate = (dateString: string) => {
  const day = new Date(dateString);
  day.setUTCHours(12);
  day.setUTCMinutes(0);
  day.setUTCSeconds(0);
  return day;
};
