// tslint:disable-next-line: file-name-casing
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as stream from 'stream';

import { IConfig } from '../../global';
import { getTeamId } from '../misc/teamUtils';

const teamVelocityFromCache = async (userConfig: IConfig, cacheDir: string) => {
  const teamsVelocity = [];
  for (const team of userConfig.teams) {
    const teamCacheFile = path.join(
      cacheDir,
      'velocity-artifacts-' + getTeamId(team.name) + '.json'
    );
    if (fs.existsSync(teamCacheFile)) {
      const input = fs.createReadStream(teamCacheFile);
      for await (const line of readLines(input)) {
        teamsVelocity.push({
          team: team.name,
          velocity: JSON.parse(line).health.weeks.velocity
        });
      }
    }
  }

  return teamsVelocity;
};

export default teamVelocityFromCache;

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
