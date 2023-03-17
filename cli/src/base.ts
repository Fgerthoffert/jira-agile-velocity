import Command from '@oclif/command';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as jsYaml from 'js-yaml';
import * as loadYamlFile from 'load-yaml-file';
import * as path from 'path';

import { UserConfig } from './global';

export default abstract class extends Command {
  userConfig = {
    jira: {
      username: 'username',
      password: 'password',
      host: 'https://jira.myhost.org',
      fields: {
        points: 'customfield_10114',
        originalPoints: 'customfield_11115',
        parentInitiative: 'customfield_11112',
        parentEpic: 'customfield_10314',
      },
      excludeDays: ['1900-01-01'],
      resolutions: {
        positive: ['Done'],
        negative: ['Incomplete'],
        ignore: ['Duplicate'],
      },
    },
    versions: {
      projectKeys: ['QA', 'BACKLOG'],
      monthsToChart: 6,
      from: '2019-01-01',
      defaultFilters: {
        name: '',
        projectKey: '',
        label: '',
        issueType: '',
        priority: '',
      },
    },
    teams: [
      {
        name: 'Team A',
        from: '2019-07-01',
        excludeDays: ['1900-01-01'],
        streams: [
          {
            name: 'Initiatives',
            completion: {
              jql:
                'sprint = Team-A and status changed to Closed ON (##TRANSITION_DATE##)',
              childOf: 'assignee = team-easy and type = initiative',
            },
            forecast: {
              jql:
                'assignee = team-easy and type = initiative and status != Closed',
              fetchChild: true,
              effortPct: 60,
            },
          },
          {
            name: 'Defects',
            completion: {
              jql:
                'sprint = Team-A and type = Bug and status changed to Closed ON (##TRANSITION_DATE##)',
              childOf: '',
            },
            forecast: {
              jql:
                'type = Bug and sprint = Team-A and (sprint in futureSprints() or sprint in openSprints()) and status != Closed',
              fetchChild: false,
              effortPct: 40,
            },
          },
        ],
      },
      {
        name: 'Team B',
        from: '2019-07-01',
        excludeDays: ['1900-01-01'],
        streams: [
          {
            name: 'Initiatives',
            completion: {
              jql:
                'sprint = Team-B and status changed to Closed ON (##TRANSITION_DATE##)',
              childOf: 'assignee = team-easy and type = initiative',
            },
            forecast: {
              jql:
                'assignee = team-easy and type = initiative and status != Closed',
              fetchChild: true,
              effortPct: 60,
            },
          },
          {
            name: 'Defects',
            completion: {
              jql:
                'sprint = Team-B and type = Bug and status changed to Closed ON (##TRANSITION_DATE##)',
              childOf: '',
            },
            forecast: {
              jql:
                'type = Bug and sprint = Team-B and (sprint in futureSprints() or sprint in openSprints()) and status != Closed',
              fetchChild: false,
              effortPct: 40,
            },
          },
        ],
      },
    ],
  };

  setUserConfig(userConfig: UserConfig) {
    this.userConfig = userConfig;
  }

  async init() {
    if (process.env.CONFIG_DIR !== undefined) {
      this.config.configDir = process.env.CONFIG_DIR;
    }
    // If config file does not exists, initialize it:
    fse.ensureDirSync(this.config.configDir);
    fse.ensureDirSync(this.config.configDir + '/cache/');

    // eslint-disable-next-line no-negated-condition
    if (!fs.existsSync(path.join(this.config.configDir, 'config.yml'))) {
      fs.writeFileSync(
        path.join(this.config.configDir, 'config.yml'),
        jsYaml.safeDump(this.userConfig),
      );
      this.log(
        'Initialized configuration file with defaults in: ' +
          path.join(this.config.configDir, 'config.yml'),
      );
      this.log('Please EDIT the configuration file first');
      this.exit();
    } else {
      this.log(
        'Configuration file exists: ' +
          path.join(this.config.configDir, 'config.yml'),
      );

      const userConfig = await loadYamlFile(
        path.join(this.config.configDir, 'config.yml'),
      );
      this.setUserConfig(userConfig);
    }
  }
}
