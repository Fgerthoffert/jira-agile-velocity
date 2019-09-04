import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as loadYamlFile from 'load-yaml-file';
import * as readline from 'readline';
import * as stream from 'stream';

import { ConfigService } from '../config.service';

@Injectable()
export class VelocityService {
  private readonly logger = new Logger(VelocityService.name);
  configBasePath: string;

  constructor(config: ConfigService) {
    this.configBasePath = config.get('CONFIG_DIR');
  }

  async getVelocity(): Promise<any> {
    const teamsVelocity = [];
    const configFilePath = path.join(this.configBasePath, 'config.yml');
    if (fs.existsSync(configFilePath)) {
      this.logger.log('Opening configuration file: ' + configFilePath);
      const userConfig = await loadYamlFile(configFilePath);

      for (const team of userConfig.teams) {
        const teamCacheFile = path.join(
          this.configBasePath + '/cache/',
          'velocity-artifact-' + getTeamId(team.name) + '.json',
        );
        if (fs.existsSync(teamCacheFile)) {
          const input = fs.createReadStream(teamCacheFile);
          for await (const line of readLines(input)) {
            teamsVelocity.push({ team: team.name, velocity: JSON.parse(line) });
          }
        }
      }
    } else {
      this.logger.log(
        'Error, unable to find configuration file: ' + configFilePath,
      );
    }
    return teamsVelocity;
  }
}

export const getTeamId = (teamName: string) => {
  return String(teamName)
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
