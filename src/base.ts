import Command, { flags } from "@oclif/command";
import * as fs from "fs";
import * as fse from "fs-extra";
import * as jsYaml from "js-yaml";
import * as path from "path";

export default abstract class extends Command {
  static flags = {
    jirausername: flags.string({
      required: false,
      env: "JIRA_USERNAME",
      description: "Jira Username used to connect to the REST API"
    }),
    jirapassword: flags.string({
      required: false,
      env: "JIRA_PASSWORD",
      description: "Jira Password used to connect to the REST API"
    }),
    jirahost: flags.string({
      required: false,
      env: "JIRA_HOST",
      description: "Jira Server Host (https://jira.myhost.com)"
    }),
    jirapoints: flags.string({
      required: false,
      env: "JIRA_POINTS",
      description: "Jira Points field"
    }),
    jirajqlcompletion: flags.string({
      required: false,
      env: "JIRA_JQL_COMPLETION",
      description: "JQL Query used to measure completion"
    }),
    jirajqlremaining: flags.string({
      required: false,
      env: "JIRA_JQL_REMAINING",
      description: "JQL Query used to fetch remaining issues"
    }),
    jirajqlhistory: flags.string({
      required: false,
      env: "JIRA_JQL_HISTORY",
      description: "Date to start fetching data from (format: 2019-01-01)"
    }),
    slackwebhook: flags.string({
      required: false,
      env: "SLACK_WEBHOOK",
      description: "Slack Webhook URL"
    }),
    slackchannel: flags.string({
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
          pointsField: "customfield_10002",
          jqlCompletion: "",
          jqlRemaining: "",
          jqlHistory: "2019-08-01"
        },
        slack: {
          webhook: "",
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
