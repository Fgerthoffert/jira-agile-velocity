export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {
  CONFIG_PATH: string;
  private readonly envConfig: EnvConfig;

  constructor() {
    const untildify = require('untildify');
    const defaultEnv = {
      CONFIG_PATH: '~/.config/jira-agile-velocity/',
    };

    if (process.env.CONFIG_PATH === undefined) {
      this.envConfig = {
        CONFIG_PATH: untildify(defaultEnv.CONFIG_PATH),
      };
    } else {
      this.envConfig = {
        CONFIG_PATH: untildify(process.env.CONFIG_PATH),
      };
    }
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
