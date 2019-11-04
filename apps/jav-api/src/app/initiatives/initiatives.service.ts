import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as stream from 'stream';
import * as loadJsonFile from 'load-json-file';

import { ConfigService } from '../config.service';

export const getTeamId = (teamName: string) => {
  return String(teamName)
    .replace('team-', '') // If team is prefixed by team-, we simply remove it from the string
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};

@Injectable()
export class InitiativesService {
  private readonly logger = new Logger(InitiativesService.name);
  configBasePath: string;

  constructor(config: ConfigService) {
    this.configBasePath = config.get('CONFIG_DIR');
  }

  async getInitiatives(): Promise<any> {
    let initiatives = [];

    const configFilePath = path.join(this.configBasePath, 'config.yml');
    if (fs.existsSync(configFilePath)) {
      this.logger.log('Opening configuration file: ' + configFilePath);
      const artifactCacheFile = path.join(
        this.configBasePath + '/cache/',
        'initiatives-artifacts.json'
      );
      if (fs.existsSync(artifactCacheFile)) {
        this.logger.log('Opening configuration file: ' + artifactCacheFile);
        initiatives = loadJsonFile.sync(artifactCacheFile);
      }
    } else {
      this.logger.log(
        'Error, unable to find configuration file: ' + configFilePath
      );
    }
    return initiatives;
  }
}
