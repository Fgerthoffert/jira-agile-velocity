import { flags } from "@oclif/command";
import * as fs from "fs";
import * as readline from "readline";
import * as stream from "stream";

import cli from "cli-ux";
import * as loadYamlFile from "load-yaml-file";
import * as path from "path";
import axios from "axios";
import { createWriteStream, createReadStream } from "fs";

import Command from "../base";

export default class Fetch extends Command {
  static description = "describe the command here";

  static flags = {
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: "n", description: "name to print" }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: "f" })
  };

  static args = [{ name: "file" }];

  async run() {
    const { args, flags } = this.parse(Fetch);
    const userConfig = await loadYamlFile(
      path.join(this.config.configDir, "config.yml")
    );
    const {
      jirausername,
      jirapassword,
      jirahost,
      jirapoints,
      jirajqlcompletion,
      jirajqlremaining,
      jirajqlhistory
    } = flags;
    const jira_username =
      jirausername !== undefined ? jirausername : userConfig.jira.username;
    const jira_password =
      jirapassword !== undefined ? jirapassword : userConfig.jira.password;
    const jira_host = jirahost !== undefined ? jirahost : userConfig.jira.host;
    const jira_points =
      jirapoints !== undefined ? jirapoints : userConfig.jira.points;
    const jira_jql_completion =
      jirajqlcompletion !== undefined
        ? jirajqlcompletion
        : userConfig.jira.jqlCompletion;
    const jira_jql_remaining =
      jirajqlremaining !== undefined
        ? jirajqlremaining
        : userConfig.jira.jqlRemaining;
    const jira_jql_history =
      jirajqlhistory !== undefined
        ? jirajqlhistory
        : userConfig.jira.jqlHistory;

    // Initialize days to fetch
    let fromDay = new Date(jira_jql_history);
    let toDay = new Date();

    let dataObject = this.initObject(fromDay, toDay);
    dataObject = this.populateObject(dataObject, jira_points);

    console.log(dataObject);
    const name = flags.name || "world";
    this.log(
      `hello ${name} from /Users/francoisgerthoffert/GitHub/fgerthoffert/jira-agile-velocity/src/commands/fetch.ts`
    );
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`);
    }
  }

  initObject = (fromDay: Date, toDay: Date) => {
    let initObject = { days: {}, weeks: {} };
    let currentDate = fromDay;
    while (currentDate < toDay) {
      currentDate.setDate(currentDate.getDate() + 1);
      initObject["days"][currentDate.toJSON().slice(0, 10)] = {
        date: currentDate.toJSON(),
        completion: {
          issues: { count: 0, velocity: 0 },
          points: { count: 0, velocity: 0 },
          list: []
        },
        scopeChangeCompletion: {
          issues: { count: 0, velocity: 0 },
          points: { count: 0, velocity: 0 },
          list: []
        }
      };
      let currentMonthDay = currentDate.getDate();
      if (currentDate.getDay() !== 0) {
        currentMonthDay = currentMonthDay - currentDate.getDay();
      }
      let currentWeekYear = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentMonthDay
      );

      if (
        initObject["weeks"][currentWeekYear.toJSON().slice(0, 10)] === undefined
      ) {
        initObject["weeks"][currentWeekYear.toJSON().slice(0, 10)] = {
          weekStart: currentWeekYear.toJSON(),
          date: currentWeekYear.toJSON(),
          completion: {
            issues: { count: 0, velocity: 0 },
            points: { count: 0, velocity: 0 },
            list: []
          },
          scopeChangeCompletion: {
            issues: { count: 0, velocity: 0 },
            points: { count: 0, velocity: 0 },
            list: []
          }
        };
      }
    }
    return initObject;
  };

  populateObject = async (dataObject, jira_points) => {
    const cacheDir = this.config.configDir + "/cache/";
    for (let [key, day] of Object.entries(dataObject.days)) {
      if (!fs.existsSync(path.join(cacheDir, key + ".ndjson"))) {
        cli.action.start(
          "Fetching data for day: " +
            key +
            " to file: " +
            path.join(cacheDir, key + ".ndjson")
        );
        const issues = await this.fetchDataFromJira(key);
        //Note: We'd still write an empty file to cache to record the fact that no issues were completed that day
        const issueFileStream = createWriteStream(
          path.join(cacheDir, key + ".ndjson"),
          { flags: "a" }
        );
        if (issues.length > 0) {
          for (let issue of issues) {
            issueFileStream.write(JSON.stringify(issue) + "\n");
          }
        }
        issueFileStream.end();
        cli.action.stop(" done");
      } else {
        const issues = [];
        const input = fs.createReadStream(path.join(cacheDir, key + ".ndjson"));
        for await (const line of this.readLines(input)) {
          issues.push(JSON.parse(line));
        }
      }

      //Issues array contains all issues closed that day, go through each issue individually

      for (let issue of issues) {
        if (dataObject["days"][key] !== undefined) {
          dataObject["days"][key]["completion"]["issues"]["count"]++;
          dataObject["days"][key]["completion"]["list"].push(issue);
        }
        if (issue[jira_points] !== undefined) {
          dataObject["days"][key]["completion"]["points"]["count"] +=
            issue[jira_points];
        }
      }
    }

    /*
    issues.forEach(issue => {
      if (issue.closedAt !== null) {
        if (dataObject["days"][issue.closedAt.slice(0, 10)] !== undefined) {
          dataObject["days"][issue.closedAt.slice(0, 10)]["completion"][
            "issues"
          ]["count"]++;
          dataObject["days"][issue.closedAt.slice(0, 10)]["completion"][
            "list"
          ].push(issue);
          if (issue.points !== null) {
            dataObject["days"][issue.closedAt.slice(0, 10)]["completion"][
              "points"
            ]["count"] += issue.points;
          }

          //Calculating if scope changed for this issue
          if (
            issue.labels.edges.filter(
              label =>
                stringClean(label.node.name) === stringClean("Scope Change")
            ).length !== 0
          ) {
            dataObject["days"][issue.closedAt.slice(0, 10)][
              "scopeChangeCompletion"
            ]["issues"]["count"]++;
            dataObject["days"][issue.closedAt.slice(0, 10)][
              "scopeChangeCompletion"
            ]["list"].push(issue);
            if (issue.points !== null) {
              dataObject["days"][issue.closedAt.slice(0, 10)][
                "scopeChangeCompletion"
              ]["points"]["count"] += issue.points;
            }
          }
        }

        let closedDate = new Date(issue.closedAt);
        let closedMonthDay = closedDate.getDate();
        if (closedDate.getDay() !== 0) {
          closedMonthDay = closedMonthDay - closedDate.getDay();
        }
        //let closedWeek = new Date(closedDate.getFullYear(), closedDate.getMonth(), closedDate.getDate() + (closedDate.getDay() == 0?0:7)-closedDate.getDay() ); //TODO - This is incorrect
        let closedWeek = new Date(
          closedDate.getFullYear(),
          closedDate.getMonth(),
          closedMonthDay
        );
        if (dataObject["weeks"][closedWeek] !== undefined) {
          dataObject["weeks"][closedWeek]["completion"]["issues"]["count"]++;
          dataObject["weeks"][closedWeek]["completion"]["list"].push(issue);
          if (issue.points !== null) {
            dataObject["weeks"][closedWeek]["completion"]["points"]["count"] +=
              issue.points;
          }

          //Calculating if scope changed for this issue
          if (
            issue.labels.edges.filter(
              label =>
                stringClean(label.node.name) === stringClean("Scope Change")
            ).length !== 0
          ) {
            dataObject["weeks"][closedWeek]["scopeChangeCompletion"]["issues"][
              "count"
            ]++;
            dataObject["weeks"][closedWeek]["scopeChangeCompletion"][
              "list"
            ].push(issue);
            if (issue.points !== null) {
              dataObject["weeks"][closedWeek]["scopeChangeCompletion"][
                "points"
              ]["count"] += issue.points;
            }
          }
        }
      }
    });
    return dataObject;
    */
  };

  fetchDataFromJira = async dateToFetch => {
    const { args, flags } = this.parse(Fetch);
    const userConfig = await loadYamlFile(
      path.join(this.config.configDir, "config.yml")
    );
    const {
      jirausername,
      jirapassword,
      jirahost,
      jirapoints,
      jirajqlcompletion
    } = flags;
    const jira_username =
      jirausername !== undefined ? jirausername : userConfig.jira.username;
    const jira_password =
      jirapassword !== undefined ? jirapassword : userConfig.jira.password;
    const jira_host = jirahost !== undefined ? jirahost : userConfig.jira.host;
    const jira_points =
      jirapoints !== undefined ? jirapoints : userConfig.jira.points;
    const jira_jql_completion =
      jirajqlcompletion !== undefined
        ? jirajqlcompletion
        : userConfig.jira.jqlCompletion;

    const jqlQuery = jira_jql_completion + " ON(" + dateToFetch + ")";
    const response = await axios({
      method: "get",
      url: jira_host + "/rest/api/2/search",
      auth: {
        username: jira_username,
        password: jira_password
      },
      params: {
        jql: jqlQuery,
        startAt: 0,
        maxResults: 1500,
        fields: [
          "id",
          "key",
          "assignee",
          "issuetype",
          "summary",
          "status",
          "project",
          "resolution"
        ]
      }
    });

    if (response.data.issues.length > 0) {
      return response.data.issues;
    }
    return [];
  };

  //https://medium.com/@wietsevenema/node-js-using-for-await-to-read-lines-from-a-file-ead1f4dd8c6f
  readLines = input => {
    const output = new stream.PassThrough({ objectMode: true });
    const rl = readline.createInterface({ input });
    rl.on("line", line => {
      output.write(line);
    });
    rl.on("close", () => {
      output.push(null);
    });
    return output;
  };
}
