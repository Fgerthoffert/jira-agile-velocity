export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {
  CONFIG_PATH: string;
  AUTH0_DISABLED: boolean;
  AUTH0_DOMAIN: string;
  AUTH0_AUDIENCE: string;

  private readonly envConfig: EnvConfig;

  constructor() {
    // eslint-disable-next-line
    const untildify = require('untildify');
    const defaultEnv = {
      CONFIG_DIR: '~/.config/jira-agile-velocity/',
      AUTH0_DISABLED: false,
      AUTH0_DOMAIN: '',
      AUTH0_AUDIENCE: '',
    };

    this.envConfig = {};
    this.envConfig.CONFIG_DIR =
      process.env.CONFIG_PATH === undefined
        ? untildify(defaultEnv.CONFIG_DIR)
        : untildify(process.env.CONFIG_PATH);
    this.envConfig.AUTH0_DISABLED =
      process.env.AUTH0_DISABLED === undefined
        ? defaultEnv.AUTH0_DISABLED
        : JSON.parse(process.env.AUTH0_DISABLED); // Trick to convert string to boolean
    this.envConfig.AUTH0_DOMAIN =
      process.env.AUTH0_DOMAIN === undefined
        ? defaultEnv.AUTH0_DOMAIN
        : process.env.AUTH0_DOMAIN;
    this.envConfig.AUTH0_AUDIENCE =
      process.env.AUTH0_AUDIENCE === undefined
        ? defaultEnv.AUTH0_AUDIENCE
        : process.env.AUTH0_AUDIENCE;
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
