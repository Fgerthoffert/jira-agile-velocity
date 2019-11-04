import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as loadYamlFile from 'load-yaml-file';
import * as readline from 'readline';
import * as stream from 'stream';

import { ConfigService } from '../config.service';

export const getTeamId = (teamName: string) => {
  return String(teamName)
    .replace('team-', '') // If team is prefixed by team-, we simply remove it from the string
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};

// https://medium.com/@wietsevenema/node-js-using-for-await-to-read-lines-from-a-file-ead1f4dd8c6f
const readLines = (input: any) => {
  const output = new stream.PassThrough({ objectMode: true });
  const rl = readline.createInterface({ input });
  rl.on('line', line => {
    output.write(line);
  });
  rl.on('close', () => {
    output.push(null);
  });
  return output;
};

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);
  configBasePath: string;

  constructor(config: ConfigService) {
    this.configBasePath = config.get('CONFIG_DIR');
  }

  async getTeams(): Promise<any> {
    const teamsTeam = [];
    const configFilePath = path.join(this.configBasePath, 'config.yml');
    if (fs.existsSync(configFilePath)) {
      this.logger.log('Opening configuration file: ' + configFilePath);
      const userConfig = await loadYamlFile(configFilePath);
      for (const team of userConfig.teams) {
        teamsTeam.push({
          id: getTeamId(team.name),
          name: team.name
        });
      }
    } else {
      this.logger.log(
        'Error, unable to find configuration file: ' + configFilePath
      );
    }
    return teamsTeam;
  }
}
