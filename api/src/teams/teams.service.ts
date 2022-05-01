import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as loadYamlFile from 'load-yaml-file';

import { ConfigService } from '../config.service';

export const getTeamId = (teamName: string) => {
  return String(teamName)
    .replace('team-', '') // If team is prefixed by team-, we simply remove it from the string
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
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
        this.logger.log(
          'Found the following teams: ' + JSON.stringify(teamsTeam),
        );
        teamsTeam.push({
          id: getTeamId(team.name),
          name: team.name,
        });
      }
    } else {
      this.logger.log(
        'Error, unable to find configuration file: ' + configFilePath,
      );
    }
    return teamsTeam;
  }
}
