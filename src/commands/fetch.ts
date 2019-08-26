import { flags } from "@oclif/command";
import cli from "cli-ux";
import * as fs from "fs";
import * as loadYamlFile from "load-yaml-file";
import * as path from "path";

import Command from "../base";
import { ICalendar, ICalendarFinal, IConfig } from "../global";
import fetchCompleted from "../utils/data/fetchCompleted";
import jiraSearchIssues from "../utils/jira/searchIssues";
import { getTeamId } from "../utils/misc/teamUtils";
import getDailyHealthMsg from "../utils/slack/getDailyHealthMsg";
import sendSlackMsg from "../utils/slack/sendSlackMsg";
import initCalendar from "../utils/velocity/initCalendar";
import insertClosed from "../utils/velocity/insertClosed";
import insertDailyVelocity from "../utils/velocity/insertDailyVelocity";
import insertForecast from "../utils/velocity/insertForecast";
import insertHealth from "../utils/velocity/insertHealth";
import insertOpen from "../utils/velocity/insertOpen";
import insertWeeklyVelocity from "../utils/velocity/insertWeeklyVelocity";

export default class Fetch extends Command {
  static description = "Build velocity stats by day and week";

  static flags = {
    ...Command.flags,
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    type: flags.string({
      char: "t",
      description: "Send slack update using issues or points",
      options: ["issues", "points"],
      default: "points"
    }),
    // flag with no value (-f, --force)
    dryrun: flags.boolean({
      char: "d",
      default: false,
      description: "Dry-Run, do not send slack message"
    })
  };

  /*
    Returns a configuration object to be used when connecting to Jira
  */
  async getJiraConnection() {
    const { flags } = this.parse(Fetch);
    const userConfig = await loadYamlFile(
      path.join(this.config.configDir, "config.yml")
    );
    const { env_jira_username, env_jira_password, env_jira_host } = flags;
    const jira_username: string =
      env_jira_username !== undefined
        ? env_jira_username
        : userConfig.jira.username;
    const jira_password: string =
      env_jira_password !== undefined
        ? env_jira_password
        : userConfig.jira.password;
    const jira_host: string =
      env_jira_host !== undefined ? env_jira_host : userConfig.jira.host;

    return { jira_username, jira_password, jira_host };
  }

  async run() {
    const { flags } = this.parse(Fetch);
    const userConfig = await loadYamlFile(
      path.join(this.config.configDir, "config.yml")
    );
    let {
      env_jira_points,
      env_jira_host,
      env_jira_jqlcompletion,
      env_jira_jqlremaining,
      env_jira_jqlhistory,
      type,
      env_slack_token,
      env_slack_channel,
      env_slack_explanation,
      dryrun
    } = flags;
    const jira_host: string =
      env_jira_host !== undefined ? env_jira_host : userConfig.jira.host;
    const jira_points: string =
      env_jira_points !== undefined
        ? env_jira_points
        : userConfig.jira.pointsField;
    const jira_jqlcompletion: string =
      env_jira_jqlcompletion !== undefined
        ? env_jira_jqlcompletion
        : userConfig.jira.jqlCompletion;
    const jira_jqlremaining: string =
      env_jira_jqlremaining !== undefined
        ? env_jira_jqlremaining
        : userConfig.jira.jqlRemaining;
    const jira_jqlhistory: string =
      env_jira_jqlhistory !== undefined
        ? env_jira_jqlhistory
        : userConfig.jira.jqlHistory;
    const slack_token: string =
      env_slack_token !== undefined ? env_slack_token : userConfig.slack.token;
    const slack_channel: string =
      env_slack_channel !== undefined
        ? env_slack_channel
        : userConfig.slack.channel;
    const slack_explanation: string =
      env_slack_explanation !== undefined
        ? env_slack_explanation
        : userConfig.slack.explanation;

    for (let team of userConfig.teams) {
      const closedIssues = await fetchCompleted(
        userConfig,
        this.config.configDir + "/cache/",
        team.name
      );
      console.log("Fetched " + closedIssues.length + " completed issues");

      const emptyCalendar: ICalendar = initCalendar(team.jqlHistory);
      const calendarWithClosed = await insertClosed(
        emptyCalendar,
        userConfig.jira.pointsField,
        closedIssues
      );

      const openIssues = await this.fetchOpenIssues(userConfig, team.name);
      const calendarWithOpen = insertOpen(
        calendarWithClosed,
        openIssues,
        userConfig.jira.pointsField
      );

      const calendarVelocity: ICalendarFinal = {
        ...calendarWithOpen,
        days: insertDailyVelocity(calendarWithOpen),
        weeks: insertWeeklyVelocity(calendarWithOpen)
      };

      const calendarWithForecast = insertForecast(calendarVelocity);
      const calendarWithHealth = insertHealth(calendarWithForecast);

      const slackMsg = getDailyHealthMsg(
        calendarWithHealth,
        type,
        userConfig,
        team.name
      );
      this.log(slackMsg);

      if (!dryrun) {
        cli.action.start("Sending message to Slack");
        sendSlackMsg(team.slack.token, team.slack.channel, slackMsg);
        cli.action.stop(" done");
      }

      const cacheDir = this.config.configDir + "/cache/";
      const issueFileStream = fs.createWriteStream(
        path.join(
          cacheDir,
          "velocity-artifact-" + getTeamId(team.name) + ".json"
        ),
        { flags: "w" }
      );
      issueFileStream.write(JSON.stringify(calendarWithHealth));
      issueFileStream.end();
      cli.action.stop(" done");
    }
  }

  /*
    Fetch open issues from Jira
  */
  fetchOpenIssues = async (userConfig: IConfig, teamName: string) => {
    const teamConfig = userConfig.teams.find(t => t.name === teamName);
    if (teamConfig !== undefined) {
      cli.action.start(
        "Fetching open issues for team: " +
          teamName +
          " using JQL: " +
          teamConfig.jqlRemaining +
          " "
      );
      const issuesJira = await jiraSearchIssues(
        userConfig.jira,
        teamConfig.jqlRemaining,
        "labels," + userConfig.jira.pointsField
      );
      cli.action.stop(" done");
      return issuesJira;
    }
    return [];
  };
}

export const formatDate = (dateString: string) => {
  let day = new Date(dateString);
  day.setUTCHours(12);
  day.setUTCMinutes(0);
  day.setUTCSeconds(0);
  return day;
};
