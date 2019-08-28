import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as jsYaml from 'js-yaml';
import * as path from 'path';
import * as loadYamlFile from 'load-yaml-file';
import * as readline from 'readline';
import * as stream from 'stream';

@Injectable()
export class VelocityService {
  async getVelocity(): Promise<any> {
    const teamsVelocity = [];

    const basePath = '/Users/fgerthoffert/.config/jira-agile-velocity/';
    const configFilePath = path.join(basePath, 'config.yml');
    if (fs.existsSync(configFilePath)) {
      console.log('Opening configuration file: ' + configFilePath);

      const userConfig = await loadYamlFile(configFilePath);

      for (let team of userConfig.teams) {
        const teamCacheFile = path.join(
          basePath + '/cache/',
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
      console.log(
        'Error, unable to find configuration file: ' + configFilePath,
      );
    }

    ///Users/fgerthoffert/.config/jira-agile-velocity/config
    return teamsVelocity;
  }
}

export const getTeamId = (teamName: string) => {
  return String(teamName)
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};

//https://medium.com/@wietsevenema/node-js-using-for-await-to-read-lines-from-a-file-ead1f4dd8c6f
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
