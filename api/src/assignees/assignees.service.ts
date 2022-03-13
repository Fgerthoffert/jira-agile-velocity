import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as loadYamlFile from 'load-yaml-file';
import * as loadJsonFile from 'load-json-file';

import { ConfigService } from '../config.service';

export const getTeamId = (teamName: string) => {
  return String(teamName)
    .replace('team-', '') // If team is prefixed by team-, we simply remove it from the string
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};

@Injectable()
export class AssigneesService {
  private readonly logger = new Logger(AssigneesService.name);
  configBasePath: string;

  constructor(config: ConfigService) {
    this.configBasePath = config.get('CONFIG_DIR');
  }

  async getVelocity(teamId: string): Promise<any> {
    const teamsVelocity = {};
    const configFilePath = path.join(this.configBasePath, 'config.yml');
    if (fs.existsSync(configFilePath)) {
      this.logger.log('Opening configuration file: ' + configFilePath);
      const userConfig = await loadYamlFile(configFilePath);

      const currentTeam = userConfig.teams.find(
        (t: any) => teamId === getTeamId(t.name),
      );
      if (currentTeam !== undefined) {
        const teamCacheFile = path.join(
          this.configBasePath + '/cache/',
          'assignees-artifacts-' + getTeamId(currentTeam.name) + '.json',
        );
        if (fs.existsSync(teamCacheFile)) {
          return {
            id: getTeamId(currentTeam.name),
            assignees: loadJsonFile.sync(teamCacheFile),
          };
        }
      } else {
        this.logger.log(
          'Error, unable to find team: ' + teamId + ' in configuration',
        );
      }
    } else {
      this.logger.log(
        'Error, unable to find configuration file: ' + configFilePath,
      );
    }
    return teamsVelocity;
  }
}
