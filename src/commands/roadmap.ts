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

export default class Roadmap extends Command {
  static description = "Build a roadmap from a set of issues";

  static flags = {
    ...Command.flags,
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    type: flags.string({
      char: "t",
      description: "Use issues of points for metrics",
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

  static args = [{ name: "file" }];

  async run() {
    const { flags } = this.parse(Roadmap);
  }
}
