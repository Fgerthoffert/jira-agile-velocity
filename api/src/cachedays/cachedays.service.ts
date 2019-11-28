import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import * as fs from 'fs';
import * as XRegExp from 'xregexp';

import { ConfigService } from '../config.service';

export const getTeamId = (teamName: string) => {
  return String(teamName)
    .replace('team-', '') // If team is prefixed by team-, we simply remove it from the string
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};

@Injectable()
export class CachedaysService {
  private readonly logger = new Logger(CachedaysService.name);
  configBasePath: string;

  constructor(config: ConfigService) {
    this.configBasePath = config.get('CONFIG_DIR');
  }

  async getCachedays(): Promise<any> {
    const cacheDir = this.configBasePath + '/cache/';
    const datRegExp = XRegExp(
      '([12]\\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01]))',
    );
    const cacheDayFiles = fs
      .readdirSync(cacheDir)
      .filter((file: string) => file.includes('.clear')) // Look for all .clear files
      .map((file: string) => XRegExp.match(file, datRegExp)) // Use a regex to extract the date
      .filter((file: string) => file !== null);

    const uniqueCacheDayFiles = [...new Set(cacheDayFiles)]; // Get only unique values
    return uniqueCacheDayFiles;
  }

  async deleteCachedays(deleteDay: string): Promise<any> {
    // First, count how many days are already queued for deletion
    const queuedDays: Array<string> = await this.getCachedays();
    if (queuedDays.length >= 5) {
      throw new NotAcceptableException(
        'Only 5 days of cache can be deleted at once',
      );
    }

    const cleanedDay = deleteDay.replace(/[^0-9-+]+/gi, '');
    this.logger.log('Received request to delete: ' + cleanedDay);

    const cacheDir = this.configBasePath + '/cache/';
    const cacheDayFiles = fs
      .readdirSync(cacheDir)
      .filter(
        (file: string) =>
          file.includes('completed') && file.includes(cleanedDay + '.ndjson'),
      );
    if (cacheDayFiles.length > 0) {
      cacheDayFiles
        .filter((file: string) => !file.includes('clear'))
        .forEach(file => {
          // All days to be cleared are first renamed into .clear
          // If there is a .clear file in the cache folder, the CLI will delete it
          // This allows the system to get a sense of how many files are pending cache refresh
          this.logger.log(
            'Renaming cache file to: ' + cacheDir + file + '.clear',
          );
          fs.renameSync(cacheDir + file, cacheDir + file + '.clear');
        });
    }
  }
}
