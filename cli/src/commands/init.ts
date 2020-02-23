import * as fs from 'fs';
import * as path from 'path';

import Command from '../base';

export default class Init extends Command {
  static description = 'Initialize the configuration file';

  static examples = ['$ jav init'];

  async run() {
    if (fs.existsSync(path.join(this.config.configDir, 'config.yml'))) {
      this.log(
        'Configuration file has been initialized in: ' +
          path.join(this.config.configDir, 'config.yml'),
      );
      this.log(
        'Note that init does not overwrite any previously existing configuration file',
      );
    } else {
      this.log(
        'Unable to initialize configuration file in: ' +
          path.join(this.config.configDir, 'config.yml'),
      );
    }
  }
}
