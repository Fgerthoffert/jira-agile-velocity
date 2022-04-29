import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as loadJsonFile from 'load-json-file';

import { ConfigService } from '../config.service';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);
  configBasePath: string;

  constructor(config: ConfigService) {
    this.configBasePath = config.get('CONFIG_DIR');
  }

  async getHistory(teamId: string, initiativeKey: string): Promise<any> {
    const cacheDir = path.join(this.configBasePath, 'cache');

    const historyFiles = fs
      .readdirSync(cacheDir)
      .filter((file: string) =>
        file.includes(`stream-artifacts-history-${teamId}-`),
      );

    const initiative = [];
    for (const hf of historyFiles) {
      const historyFile = path.join(cacheDir, hf);
      const fileContent = loadJsonFile.sync(historyFile);
      for (const stream of fileContent.forecast) {
        for (const issue of stream.issues) {
          if (issue.key === initiativeKey) {
            initiative.push({
              key: issue.key,
              summmary: issue.summary,
              metrics: issue.metrics,
              updatedAt: fileContent.updatedAt,
            });
          }
        }
      }
    }
    return initiative;
  }
}
