
import * as fs from 'fs';
import * as path from 'path';
import * as loadJsonFile from 'load-json-file';

import { IConfig } from '../../global';
import { getTeamId } from '../misc/teamUtils';

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
