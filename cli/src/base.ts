import Command from '@oclif/command';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as jsYaml from 'js-yaml';
import * as loadYamlFile from 'load-yaml-file';
import * as path from 'path';

import { IConfig } from './global';

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
    },
    teams: [{
      name: 'Team 1',
      jqlHistory: '2019-07-01',
      excludeDays: ['1900-01-01'],
      completion: {
        all: 'Insert a JQL query to be used to record the overall completion of a team',
        categories: [{
          name: 'Bugs',
          jql: 'Insert a JQL query to be used to capture the completion of a category'
        }, {
          name: 'Tech Debt',
          jql: 'Insert a JQL query to be used to capture the completion of a category'
        }]
      },
      forecast: {
        categories: [{
          name: 'Initiatives',
          jql: 'Insert a JQL query to be used to capture the completion of a category',
          // If set to true, all stories fetched in the JQL query, 
          // will be queried again to fetch all of their children
          fetchChild: true,
          // Exclude stories that might have been fetched from the following 
          // other forecast queries
          exclude: []
        }, {
          name: 'Tech Debt',
          jql: 'Insert a JQL query to be used to capture the completion of a category',
          fetchChild: false,
          exclude: ['Initiatives']
        }]
      }
    }],
    roadmap: {
      jqlInitiatives: 'type = initiative',
      forecastWeeks: 26,
      teams: ['Team 1, Team 2'],
    },
  };

  setUserConfig(userConfig: IConfig) {
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
