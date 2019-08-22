import Command, { flags } from "@oclif/command";
import * as fs from "fs";
import * as fse from "fs-extra";
import * as jsYaml from "js-yaml";
import * as path from "path";

export default abstract class extends Command {
  static flags = {
    env_jira_username: flags.string({
      required: false,
      env: "JIRA_USERNAME",
      description: "Jira Username used to connect to the REST API"
    }),
    env_jira_password: flags.string({
      required: false,
      env: "JIRA_PASSWORD",
      description: "Jira Password used to connect to the REST API"
    }),
    env_jira_host: flags.string({
      required: false,
      env: "JIRA_HOST",
      description: "Jira Server Host (https://jira.myhost.com)"
    }),
    env_jira_points: flags.string({
      required: false,
      env: "JIRA_POINTS",
      description: "Jira Points field"
    }),
    env_jira_jqlcompletion: flags.string({
      required: false,
      env: "JIRA_JQL_COMPLETION",
      description: "JQL Query used to measure completion"
    }),
    env_jira_jqlremaining: flags.string({
      required: false,
      env: "JIRA_JQL_REMAINING",
      description: "JQL Query used to fetch remaining tickets"
    }),
    env_jira_jqlhistory: flags.string({
      required: false,
      env: "JIRA_JQL_HISTORY",
      description: "Date to start fetching data from (format: 2019-01-01)"
    }),
    env_slack_token: flags.string({
      required: false,
      env: "SLACK_TOKEN",
      description: "Slack Token"
    }),
    env_slack_channel: flags.string({
      required: false,
      env: "SLACK_CHANNEL",
      description: "Slack channel to post content to"
    })
  };

  async init() {
    // If config file does not exists, initialize it:
    fse.ensureDirSync(this.config.configDir);
    fse.ensureDirSync(this.config.configDir + "/cache/");
    if (!fs.existsSync(path.join(this.config.configDir, "config.yml"))) {
      const defaultConfig = {
        jira: {
          username: "username",
          password: "password",
          host: "https://jira.myhost.org",
          pointsField: "customfield_10114",
          jqlCompletion: "",
          jqlRemaining: "",
          jqlHistory: "2019-08-01"
        },
        slack: {
          token: "",
          channel: ""
        }
      };
      fs.writeFileSync(
        path.join(this.config.configDir, "config.yml"),
        jsYaml.safeDump(defaultConfig)
      );
      this.log(
        "Initialized configuration file with defaults in: " +
          path.join(this.config.configDir, "config.yml")
      );
    } else {
      this.log(
        "Configuration file exists: " +
          path.join(this.config.configDir, "config.yml")
      );
    }
  }
}
