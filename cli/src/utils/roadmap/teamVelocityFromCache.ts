// tslint:disable-next-line: file-name-casing
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as stream from 'stream';
import * as loadJsonFile from 'load-json-file';

import { IConfig } from '../../global';
import { getTeamId } from '../misc/teamUtils';

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

const teamVelocityFromCache = async (userConfig: IConfig, cacheDir: string) => {
  const teamsVelocity = [];
  for (const team of userConfig.roadmap.teams) {
    const teamCacheFile = path.join(
      cacheDir,
      'velocity-artifacts-' + getTeamId(team) + '.json',
    );
    if (fs.existsSync(teamCacheFile)) {
      const teamVelocity: any = loadJsonFile.sync(teamCacheFile);
      teamsVelocity.push({
        team: team,
        velocity: teamVelocity.health.weeks.velocity,
      });
    }
  }
  return teamsVelocity;
};

export default teamVelocityFromCache;
