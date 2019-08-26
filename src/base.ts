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
    env_jira_roadmap_jql: flags.string({
      required: false,
      env: "JIRA_ROADMAP_JQL",
      description: "JQL Query to start building the roadmap from"
    }),
    env_jira_roadmap_pointstype: flags.string({
      required: false,
      env: "JIRA_ROADMAP_POINTSTYPE",
      description: "Issuetype to which points should be attached"
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
    }),
    env_slack_explanation: flags.string({
      required: false,
      env: "SLACK_EXPLANATION",
      description:
        "Explanation about the metrics to append to the slack message"
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
          jqlHistory: "2019-07-01",
          roadmapJql: "",
          roadmapPointstype: "Story"
        },
        teams: [
          {
            name: "Team 1",
            jqlCompletion:
              "Insert a JQL query to be used to record past completion",
            jqlRemaining:
              "Insert a JQL query to collect a list of tickets to be completed",
            jqlHistory: "2019-07-01",
            slack: {
              token: "",
              channel: "",
              explanation: ""
            }
          },
          {
            name: "Team 2",
            jqlCompletion:
              "Insert a JQL query to be used to record past completion",
            jqlRemaining:
              "Insert a JQL query to collect a list of tickets to be completed",
            jqlHistory: "2019-07-01",
            slack: {
              token: "",
              channel: "",
              explanation: ""
            }
          }
        ],
        roadmap: {
          jqlInitiatives: "type = initiative",
          teams: ["Team 1, Team 2"]
        },
        slack: {
          token: "",
          channel: "",
          explanation: ""
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
      this.log("Please EDIT the configuration file first");
      this.exit();
    } else {
      this.log(
        "Configuration file exists: " +
          path.join(this.config.configDir, "config.yml")
      );
    }
  }
}
