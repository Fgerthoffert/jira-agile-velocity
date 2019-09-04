export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {
  CONFIG_PATH: string;
  private readonly envConfig: EnvConfig;

  constructor() {
    const untildify = require('untildify');
    const defaultEnv = {
      CONFIG_DIR: '~/.config/jira-agile-velocity/',
    };

    if (process.env.CONFIG_PATH === undefined) {
      this.envConfig = {
        CONFIG_DIR: untildify(defaultEnv.CONFIG_DIR),
      };
    } else {
      this.envConfig = {
        CONFIG_DIR: untildify(process.env.CONFIG_DIR),
      };
    }
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
