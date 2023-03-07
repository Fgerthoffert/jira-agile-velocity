import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as loadYamlFile from 'load-yaml-file';
import * as loadJsonFile from 'load-json-file';

import { ConfigService } from '../config.service';

@Injectable()
export class VersionsService {
  private readonly logger = new Logger(VersionsService.name);
  configBasePath: string;

  constructor(config: ConfigService) {
    this.configBasePath = config.get('CONFIG_DIR');
  }

  async getVersions(): Promise<any> {
    const configFilePath = path.join(this.configBasePath, 'config.yml');
    if (fs.existsSync(configFilePath)) {
      this.logger.log('Opening configuration file: ' + configFilePath);
      const userConfig = await loadYamlFile(configFilePath);

      const versionsCacheFile = path.join(this.configBasePath + '/cache/', 'versions.json');
      if (fs.existsSync(versionsCacheFile)) {
        this.logger.log(`Opening cache file ${versionsCacheFile}`);
        return loadJsonFile.sync(versionsCacheFile);
      } else {
        this.logger.log(`Unable to find cache file ${versionsCacheFile}`);
      }
    }
  }
}
