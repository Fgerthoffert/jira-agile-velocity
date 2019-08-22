import { flags } from "@oclif/command";
import cli from "cli-ux";
import * as fs from "fs";
import * as loadYamlFile from "load-yaml-file";
import * as path from "path";

import { ICalendar, ICalendarFinal } from "../global";
import Command from "../base";
import jiraSearchIssues from "../utils/jira/searchIssues";
import sendSlackDailyHealth from "../utils/slack/sendSlackMsg";
import getDailyHealthMsg from "../utils/slack/getDailyHealthMsg";
import initCalendar from "../utils/velocity/initCalendar";
import insertClosed from "../utils/velocity/insertClosed";
import insertDailyVelocity from "../utils/velocity/insertDailyVelocity";
import insertForecast from "../utils/velocity/insertForecast";
import insertHealth from "../utils/velocity/insertHealth";
import insertOpen from "../utils/velocity/insertOpen";
import insertWeeklyVelocity from "../utils/velocity/insertWeeklyVelocity";
import sendSlackMsg from "../utils/slack/sendSlackMsg";

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

    // Initialize days to fetch
    let fromDay = formatDate(jira_jqlhistory);
    let toDay = new Date();
    toDay.setDate(toDay.getDate() - 2);

    this.log("Generating stats from: " + fromDay + " to: " + toDay);

    //First - Initialize a calendar with all days and weeks between the two dates
    const emptyCalendar: ICalendar = initCalendar(fromDay, toDay);
    await this.fetchMissingDays(emptyCalendar, jira_jqlcompletion);
    const calendarWithClosed = await insertClosed(
      emptyCalendar,
      this.config.configDir + "/cache/",
      jira_points
    );

    const openIssues = await this.fetchOpenIssues(jira_jqlremaining);
    const calendarWithOpen = insertOpen(
      calendarWithClosed,
      openIssues,
      jira_points
    );

    const calendarVelocity: ICalendarFinal = {
      ...calendarWithOpen,
      days: insertDailyVelocity(calendarWithOpen),
      weeks: insertWeeklyVelocity(calendarWithOpen)
    };
    //    const calendarWithDailyVelocity = insertDailyVelocity(calendarWithOpen);
    //    const calendarWithWeeklyVelocity = insertWeeklyVelocity(
    //      calendarWithDailyVelocity
    //    );

    const calendarWithForecast = insertForecast(calendarVelocity);
    const calendarWithHealth = insertHealth(calendarWithForecast);

    const slackMsg = getDailyHealthMsg(
      calendarWithHealth,
      type,
      jira_jqlremaining,
      jira_jqlcompletion,
      jira_host,
      slack_explanation
    );
    this.log(slackMsg);

    if (!dryrun) {
      cli.action.start("Sending message to Slack");
      sendSlackMsg(slack_token, slack_channel, slackMsg);
      cli.action.stop(" done");
    }
    //    sendSlackDailyHealth(calendarWithHealth, this.log, type);

    const cacheDir = this.config.configDir + "/cache/";
    const issueFileStream = fs.createWriteStream(
      path.join(cacheDir, "fetch-artifact.json"),
      { flags: "w" }
    );
    issueFileStream.write(JSON.stringify(calendarWithHealth));
    issueFileStream.end();
    cli.action.stop(" done");
  }

  /*
    Fetch days which are not yet in cache from Jira
  */
  fetchMissingDays = async (
    calendar: ICalendar,
    jira_jql_completion: string
  ) => {
    const cacheDir = this.config.configDir + "/cache/";
    for (let [dateKey] of Object.entries(calendar.days)) {
      if (
        !fs.existsSync(path.join(cacheDir, "completed-" + dateKey + ".ndjson"))
      ) {
        cli.action.start(
          "Fetching data for day: " +
            dateKey +
            " to file: " +
            path.join(cacheDir, "completed-" + dateKey + ".ndjson")
        );

        const jqlQuery = jira_jql_completion + " ON(" + dateKey + ")";
        const jiraConnection = await this.getJiraConnection();
        const issuesJira = await jiraSearchIssues(jiraConnection, jqlQuery);
        //const issuesJira = await this.fetchDataFromJira(jqlQuery);
        //Note: We'd still write an empty file to cache to record the fact that no issues were completed that day
        const issueFileStream = fs.createWriteStream(
          path.join(cacheDir, "completed-" + dateKey + ".ndjson"),
          { flags: "a" }
        );
        if (issuesJira.length > 0) {
          for (let issue of issuesJira) {
            issueFileStream.write(JSON.stringify(issue) + "\n");
          }
        }
        issueFileStream.end();
        cli.action.stop(" done");
      }
    }
  };

  /*
    Fetch open issues from Jira
  */
  fetchOpenIssues = async (jira_jql_remaining: string) => {
    cli.action.start("Fetching open issues using: " + jira_jql_remaining + " ");
    const jiraConnection = await this.getJiraConnection();
    const issuesJira = await jiraSearchIssues(
      jiraConnection,
      jira_jql_remaining
    );
    cli.action.stop(" done");
    return issuesJira;
  };
}

export const formatDate = (dateString: string) => {
  let day = new Date(dateString);
  day.setUTCHours(12);
  day.setUTCMinutes(0);
  day.setUTCSeconds(0);
  return day;
};
