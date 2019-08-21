import { flags } from "@oclif/command";
import cli from "cli-ux";
import { getWeek, getYear } from "date-fns";
import * as fs from "fs";
import * as loadYamlFile from "load-yaml-file";
import * as path from "path";
import * as readline from "readline";
import * as stream from "stream";

import Command from "../base";
import jiraSearchIssues from "../utils/jira/searchIssues";
import initCalendar from "../utils/velocity/initCalendar";

export default class Fetch extends Command {
  static description = "Build velocity stats by day and week";

  static flags = {
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: "n", description: "name to print" }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: "f" })
  };

  static args = [{ name: "file" }];

  /*
    Returns a configuration object to be used when connecting to Jira
  */
  async getJiraConnection() {
    const { flags } = this.parse(Fetch);
    const userConfig = await loadYamlFile(
      path.join(this.config.configDir, "config.yml")
    );
    const { jirausername, jirapassword, jirahost } = flags;
    const jira_username =
      jirausername !== undefined ? jirausername : userConfig.jira.username;
    const jira_password =
      jirapassword !== undefined ? jirapassword : userConfig.jira.password;
    const jira_host = jirahost !== undefined ? jirahost : userConfig.jira.host;
    return { jira_username, jira_password, jira_host };
  }

  async run() {
    const { args, flags } = this.parse(Fetch);
    const userConfig = await loadYamlFile(
      path.join(this.config.configDir, "config.yml")
    );
    const {
      jirapoints,
      jirajqlcompletion,
      jirajqlremaining,
      jirajqlhistory
    } = flags;
    const jira_points =
      jirapoints !== undefined ? jirapoints : userConfig.jira.pointsField;
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
    let fromDay = formatDate(jira_jql_history);
    let toDay = new Date();
    toDay.setDate(toDay.getDate() - 2);

    this.log("Generating stats from: " + fromDay + " to: " + toDay);

    //First - Initialize a calendar with all days and weeks between the two dates
    let emptyCalendar = initCalendar(fromDay, toDay);

    let dataObject = await this.populateObject(
      emptyCalendar,
      jira_points,
      jira_jql_completion
    ); // Add completion counts to the object
    dataObject = await this.populateOpen(
      dataObject,
      jira_points,
      jira_jql_remaining
    ); // Add open issues counts to the object
    dataObject = this.populateTicketsPerDay(dataObject);
    dataObject = this.populateTicketsPerWeek(dataObject);

    dataObject = this.slackMetrics(dataObject);
    // Slack message
    this.log("-----------------------------------------------------------");
    this.log("Howdy everyone, here are our velocity stats, live from Jira");
    this.log("====================== IN POINTS ===========================");
    this.log(
      "Remaining Points: " +
        dataObject.open.points +
        " (" +
        dataObject.open.issues.length +
        " tkts)"
    );
    this.log(
      "On " +
        dataObject.slack.previousDay.weekday +
        ", we completed: " +
        dataObject.slack.previousDay.completed.points.count +
        " pts (" +
        dataObject.slack.previousDay.completed.issues.count +
        " tickets) [Max: " +
        dataObject.slack.previousDay.completed.points.max +
        " pts / Min: " +
        dataObject.slack.previousDay.completed.points.min +
        " / Avg: " +
        dataObject.slack.previousDay.completed.points.avg +
        " for " +
        dataObject.slack.previousDay.weekday +
        "s]"
    );
    this.log(
      "Our daily velocity is at " +
        dataObject.slack.previousDay.velocity.points.count +
        " pts/day and is going: " +
        dataObject.slack.previousDay.velocity.points.trend
    );
    this.log(
      "This week (" +
        dataObject.slack.previousWeek.weekYear +
        ") we completed: " +
        dataObject.slack.previousWeek.completed.points.count +
        " pts [Max: " +
        dataObject.slack.previousWeek.completed.points.max +
        " / Min: " +
        dataObject.slack.previousWeek.completed.points.min +
        " / Avg: " +
        dataObject.slack.previousWeek.completed.points.avg +
        "]"
    );
    this.log(
      "Our weekly velocity is at " +
        dataObject.slack.previousWeek.velocity.points.count +
        " pts/week and is going: " +
        dataObject.slack.previousWeek.velocity.points.trend
    );
    this.log(
      "Estimated sprint completion in: " +
        dataObject.slack.timeToCompletion.completion.points.effort +
        " days"
    );
    this.log("=================== IN TICKET COUNT =======================");
    this.log(
      "Remaining Tickets: " +
        dataObject.open.issues.length +
        " (" +
        dataObject.open.points +
        " pts)"
    );
    this.log(
      "On " +
        dataObject.slack.previousDay.weekday +
        ", we completed: " +
        dataObject.slack.previousDay.completed.issues.count +
        " tkts [Max: " +
        dataObject.slack.previousDay.completed.issues.max +
        " tkts / Min: " +
        dataObject.slack.previousDay.completed.issues.min +
        " / Avg: " +
        dataObject.slack.previousDay.completed.issues.avg +
        " for " +
        dataObject.slack.previousDay.weekday +
        "s]"
    );
    this.log(
      "Our daily velocity is at " +
        dataObject.slack.previousDay.velocity.issues.count +
        " tkts/day and is going: " +
        dataObject.slack.previousDay.velocity.issues.trend
    );
    this.log(
      "This week (" +
        dataObject.slack.previousWeek.weekYear +
        ") we completed: " +
        dataObject.slack.previousWeek.completed.issues.count +
        " tkts [Max: " +
        dataObject.slack.previousWeek.completed.issues.max +
        " / Min: " +
        dataObject.slack.previousWeek.completed.issues.min +
        " / Avg: " +
        dataObject.slack.previousWeek.completed.issues.avg +
        "]"
    );
    this.log(
      "Our weekly velocity is at " +
        dataObject.slack.previousWeek.velocity.issues.count +
        " pts/week and is going: " +
        dataObject.slack.previousWeek.velocity.issues.trend
    );
    this.log(
      "Estimated sprint completion in: " +
        dataObject.slack.timeToCompletion.completion.issues.effort +
        " days"
    );

    const cacheDir = this.config.configDir + "/cache/";
    const issueFileStream = fs.createWriteStream(
      path.join(cacheDir, "artifact.json"),
      { flags: "w" }
    );
    issueFileStream.write(JSON.stringify(dataObject));
    issueFileStream.end();
    cli.action.stop(" done");
  }

  populateOpen = async (dataObject, jira_points, jira_jql_remaining) => {
    //const jira_jql_remaining = 'status not in (Closed, done) and assignee in membersOf("optimistic-outlaws") and sprint in openSprints()'
    cli.action.start("Fetching remaining issues");
    console.log(jira_jql_remaining);

    const jiraConnection = await this.getJiraConnection();
    const issuesJira = await jiraSearchIssues(
      jiraConnection,
      jira_jql_remaining
    );
    //    const issuesJira = await this.fetchDataFromJira(jira_jql_remaining);
    cli.action.stop(" done (" + issuesJira.length + " issues)");
    let remainingPoints = issuesJira
      .filter(issue => issue.fields[jira_points] !== undefined)
      .map(issue => issue.fields[jira_points])
      .reduce((acc, points) => acc + points, 0);
    dataObject["open"] = { issues: issuesJira, points: remainingPoints };
    return dataObject;
  };

  slackMetrics = dataObject => {
    // Build for Days
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    let lastDay = false;
    let lastDayCompleted = {};
    let referenceDaysPoints = [];
    let referenceDaysCount = [];
    let referenceDay = null;
    for (let i = dataObject.days.length - 1; i >= 0; i--) {
      const day = new Date(dataObject.days[i].date).getDay();

      if (day !== 0 && day !== 6 && lastDay === false) {
        referenceDay = day;
        //get Velocity trend
        let velocityTrendPoints = "DOWN";
        if (
          dataObject.days[i].completion.points.velocity >
          dataObject.days[i - 1].completion.points.velocity
        ) {
          velocityTrendPoints = "UP";
        } else if (
          dataObject.days[i].completion.points.velocity ===
          dataObject.days[i - 1].completion.points.velocity
        ) {
          velocityTrendPoints = "FLAT";
        }
        let velocityTrendIssues = "DOWN";
        if (
          dataObject.days[i].completion.issues.velocity >
          dataObject.days[i - 1].completion.issues.velocity
        ) {
          velocityTrendIssues = "UP";
        } else if (
          dataObject.days[i].completion.issues.velocity ===
          dataObject.days[i - 1].completion.issues.velocity
        ) {
          velocityTrendIssues = "FLAT";
        }
        lastDay = true;
        lastDayCompleted = {
          weekday: days[day],
          completed: {
            points: {
              count: dataObject.days[i].completion.points.count,
              min: 0,
              max: 0,
              avg: 0
            },
            issues: {
              count: dataObject.days[i].completion.issues.count,
              min: 0,
              max: 0,
              avg: 0
            }
          },
          velocity: {
            points: {
              count: dataObject.days[i].completion.points.velocity,
              trend: velocityTrendPoints
            },
            issues: {
              count: dataObject.days[i].completion.issues.velocity,
              trend: velocityTrendIssues
            }
          }
        };
        //        console.log(dataObject.days[i])
      }
      if (referenceDay === day) {
        referenceDaysPoints.push(dataObject.days[i].completion.points.count);
        referenceDaysCount.push(dataObject.days[i].completion.issues.count);
      }
    }
    lastDayCompleted.completed.points.min = Math.min(...referenceDaysPoints);
    lastDayCompleted.completed.points.max = Math.max(...referenceDaysPoints);
    lastDayCompleted.completed.points.avg =
      Math.round(
        (referenceDaysPoints.reduce((a, b) => a + b, 0) /
          referenceDaysPoints.length) *
          100
      ) / 100;

    lastDayCompleted.completed.issues.min = Math.min(...referenceDaysCount);
    lastDayCompleted.completed.issues.max = Math.max(...referenceDaysCount);
    lastDayCompleted.completed.issues.avg =
      Math.round(
        (referenceDaysCount.reduce((a, b) => a + b, 0) /
          referenceDaysCount.length) *
          100
      ) / 100;

    //Build for weeks
    let lastWeek = false;
    let lastWeekCompleted = {};
    let referenceWeeksPoints = [];
    let referenceWeeksCount = [];
    for (let i = dataObject.weeks.length - 1; i >= 0; i--) {
      if (lastWeek === false) {
        //get Velocity trend
        let velocityTrendPoints = "DOWN";
        if (
          dataObject.weeks[i].completion.points.velocity >
          dataObject.weeks[i - 1].completion.points.velocity
        ) {
          velocityTrendPoints = "UP";
        } else if (
          dataObject.weeks[i].completion.points.velocity ===
          dataObject.weeks[i - 1].completion.points.velocity
        ) {
          velocityTrendPoints = "FLAT";
        }
        let velocityTrendIssues = "DOWN";
        if (
          dataObject.weeks[i].completion.issues.velocity >
          dataObject.weeks[i - 1].completion.issues.velocity
        ) {
          velocityTrendIssues = "UP";
        } else if (
          dataObject.weeks[i].completion.issues.velocity ===
          dataObject.weeks[i - 1].completion.issues.velocity
        ) {
          velocityTrendIssues = "FLAT";
        }
        lastWeek = true;
        lastWeekCompleted = {
          weekYear:
            getYear(new Date(dataObject.weeks[i].date)) +
            "." +
            getWeek(new Date(dataObject.weeks[i].date)),
          completed: {
            points: {
              count: dataObject.weeks[i].completion.points.count,
              min: 0,
              max: 0,
              avg: 0
            },
            issues: {
              count: dataObject.weeks[i].completion.issues.count,
              min: 0,
              max: 0,
              avg: 0
            }
          },
          velocity: {
            points: {
              count: dataObject.weeks[i].completion.points.velocity,
              trend: velocityTrendPoints
            },
            issues: {
              count: dataObject.weeks[i].completion.issues.velocity,
              trend: velocityTrendIssues
            }
          }
        };
      }
      referenceWeeksPoints.push(dataObject.weeks[i].completion.points.count);
      referenceWeeksCount.push(dataObject.weeks[i].completion.issues.count);
    }
    lastWeekCompleted.completed.points.min = Math.min(...referenceWeeksPoints);
    lastWeekCompleted.completed.points.max = Math.max(...referenceWeeksPoints);
    lastWeekCompleted.completed.points.avg =
      Math.round(
        (referenceWeeksPoints.reduce((a, b) => a + b, 0) /
          referenceWeeksPoints.length) *
          100
      ) / 100;

    lastWeekCompleted.completed.issues.min = Math.min(...referenceWeeksCount);
    lastWeekCompleted.completed.issues.max = Math.max(...referenceWeeksCount);
    lastWeekCompleted.completed.issues.avg =
      Math.round(
        (referenceWeeksCount.reduce((a, b) => a + b, 0) /
          referenceWeeksCount.length) *
          100
      ) / 100;

    dataObject["slack"] = {
      previousDay: lastDayCompleted,
      previousWeek: lastWeekCompleted,
      timeToCompletion: dataObject["velocity"].filter(
        v => v.range === dataObject["defaultVelocity"]
      )[0]
    };

    console.log(dataObject["slack"]);
    return dataObject;
  };

  populateTicketsPerDay = dataObject => {
    let ticketsPerDay = Object.values(dataObject["days"]);
    let startIdx = 0;
    ticketsPerDay.map(function(value, idx) {
      if (idx <= 20) {
        startIdx = 0;
      } else {
        startIdx = idx - 20;
      }
      if (idx !== 0) {
        let currentWindowIssues = ticketsPerDay.slice(startIdx, idx); // This limits the window or velocity calculation to 20 days (4 weeks).
        ticketsPerDay[idx]["completion"]["issues"][
          "velocity"
        ] = calculateAverageVelocity(
          currentWindowIssues,
          "completion",
          "issues"
        );
        ticketsPerDay[idx]["completion"]["points"][
          "velocity"
        ] = calculateAverageVelocity(
          currentWindowIssues,
          "completion",
          "points"
        );
        ticketsPerDay[idx]["scopeChangeCompletion"]["issues"][
          "velocity"
        ] = calculateAverageVelocity(
          currentWindowIssues,
          "scopeChangeCompletion",
          "issues"
        );
        ticketsPerDay[idx]["scopeChangeCompletion"]["points"][
          "velocity"
        ] = calculateAverageVelocity(
          currentWindowIssues,
          "scopeChangeCompletion",
          "points"
        );
      }
    });
    //    console.log(JSON.stringify(ticketsPerDay));
    dataObject["days"] = ticketsPerDay;
    return dataObject;
  };

  populateTicketsPerWeek = dataObject => {
    //    console.log('populateTicketsPerWeek');
    let completionVelocities = [];
    let remainingIssuesCount = dataObject.open.issues.length;
    let remainingPoints = dataObject.open.issues
      .filter(issue => issue.points !== null)
      .map(issue => issue.points)
      .reduce((acc, points) => acc + points, 0);

    let ticketsPerWeek = Object.values(dataObject["weeks"]);
    let defaultVelocity = "all";
    ticketsPerWeek.map(function(value, idx) {
      let startIdx = 0;
      if (idx <= 4) {
        startIdx = 0;
      } else {
        startIdx = idx - 4;
      }
      if (idx !== 0) {
        let currentWindowIssues = ticketsPerWeek.slice(startIdx, idx);
        ticketsPerWeek[idx]["completion"]["issues"][
          "velocity"
        ] = calculateAverageVelocity(
          currentWindowIssues,
          "completion",
          "issues"
        );
        ticketsPerWeek[idx]["completion"]["points"][
          "velocity"
        ] = calculateAverageVelocity(
          currentWindowIssues,
          "completion",
          "points"
        );
        ticketsPerWeek[idx]["scopeChangeCompletion"]["issues"][
          "velocity"
        ] = calculateAverageVelocity(
          currentWindowIssues,
          "scopeChangeCompletion",
          "issues"
        );
        ticketsPerWeek[idx]["scopeChangeCompletion"]["points"][
          "velocity"
        ] = calculateAverageVelocity(
          currentWindowIssues,
          "scopeChangeCompletion",
          "points"
        );
      }
      if (idx == ticketsPerWeek.length - 1) {
        //This is the last date of the sprint, calculate velocity on various timeframes
        let currentCompletion = {
          // All Time
          range: "all",
          completion: {
            issues: {
              velocity: calculateAverageVelocity(
                ticketsPerWeek,
                "completion",
                "issues"
              )
            },
            points: {
              velocity: calculateAverageVelocity(
                ticketsPerWeek,
                "completion",
                "points"
              )
            }
          }
        };
        currentCompletion["completion"]["issues"]["effort"] = Math.round(
          (remainingIssuesCount /
            currentCompletion["completion"]["issues"]["velocity"]) *
            5,
          3
        ); //Multiplies by 5 as per 5 days in work week
        currentCompletion["completion"]["points"]["effort"] = Math.round(
          (remainingPoints /
            currentCompletion["completion"]["points"]["velocity"]) *
            5,
          3
        );
        completionVelocities.push(currentCompletion);

        if (idx >= 4) {
          // 4 weeks
          let currentWindowIssues = ticketsPerWeek.slice(idx - 4, idx);
          let currentCompletion = {
            range: "4w",
            completion: {
              issues: {
                velocity: calculateAverageVelocity(
                  currentWindowIssues,
                  "completion",
                  "issues"
                )
              },
              points: {
                velocity: calculateAverageVelocity(
                  currentWindowIssues,
                  "completion",
                  "points"
                )
              }
            }
          };
          currentCompletion["completion"]["issues"]["effort"] = Math.round(
            (remainingIssuesCount /
              currentCompletion["completion"]["issues"]["velocity"]) *
              5,
            3
          );
          currentCompletion["completion"]["points"]["effort"] = Math.round(
            (remainingPoints /
              currentCompletion["completion"]["points"]["velocity"]) *
              5,
            3
          );
          completionVelocities.push(currentCompletion);
          defaultVelocity = "4w";
        }
        if (idx >= 8) {
          // 8 weeks
          let currentWindowIssues = ticketsPerWeek.slice(idx - 8, idx);
          let currentCompletion = {
            range: "8w",
            completion: {
              issues: {
                velocity: calculateAverageVelocity(
                  currentWindowIssues,
                  "completion",
                  "issues"
                )
              },
              points: {
                velocity: calculateAverageVelocity(
                  currentWindowIssues,
                  "completion",
                  "points"
                )
              }
            }
          };
          currentCompletion["completion"]["issues"]["effort"] = Math.round(
            (remainingIssuesCount /
              currentCompletion["completion"]["issues"]["velocity"]) *
              5,
            3
          );
          currentCompletion["completion"]["points"]["effort"] = Math.round(
            (remainingPoints /
              currentCompletion["completion"]["points"]["velocity"]) *
              5,
            3
          );
          completionVelocities.push(currentCompletion);
        }
        if (idx >= 12) {
          // 12 weeks
          let currentWindowIssues = ticketsPerWeek.slice(idx - 12, idx);
          let currentCompletion = {
            range: "12w",
            completion: {
              issues: {
                velocity: calculateAverageVelocity(
                  currentWindowIssues,
                  "completion",
                  "issues"
                )
              },
              points: {
                velocity: calculateAverageVelocity(
                  currentWindowIssues,
                  "completion",
                  "points"
                )
              }
            }
          };
          currentCompletion["completion"]["issues"]["effort"] = Math.round(
            (remainingIssuesCount /
              currentCompletion["completion"]["issues"]["velocity"]) *
              5,
            3
          );
          currentCompletion["completion"]["points"]["effort"] = Math.round(
            (remainingPoints /
              currentCompletion["completion"]["points"]["velocity"]) *
              5,
            3
          );
          completionVelocities.push(currentCompletion);
        }
      }
    });
    dataObject["weeks"] = ticketsPerWeek;
    dataObject["velocity"] = completionVelocities;
    dataObject["defaultVelocity"] = defaultVelocity;
    return dataObject;
    //    return {ticketsPerWeek, completionVelocities};
  };

  populateObject = async (dataObject, jira_points, jira_jql_completion) => {
    const cacheDir = this.config.configDir + "/cache/";
    for (let [dateKey, dateData] of Object.entries(dataObject.days)) {
      const issues = await this.getCompletedIssues(
        dateKey,
        jira_jql_completion
      );
      //Issues array contains all issues closed that day, go through each issue individually
      for (let issue of issues) {
        if (dataObject["days"][dateKey] !== undefined) {
          dataObject["days"][dateKey]["completion"]["issues"]["count"]++;
          dataObject["days"][dateKey]["completion"]["list"].push(issue);
        }
        if (
          issue.fields[jira_points] !== undefined &&
          issue.fields[jira_points] !== null
        ) {
          dataObject["days"][dateKey]["completion"]["points"][
            "count"
          ] += parseInt(issue.fields[jira_points]);
        }

        // Calculating scope change for this issue
        if (
          issue.fields.labels.filter(
            label =>
              this.stringClean(label) === this.stringClean("Scope Change")
          ).length !== 0
        ) {
          dataObject["days"][dateKey]["scopeChangeCompletion"]["issues"][
            "count"
          ]++;
          dataObject["days"][dateKey]["scopeChangeCompletion"]["list"].push(
            issue
          );
          if (
            issue.fields[jira_points] !== undefined &&
            issue.fields[jira_points] !== null
          ) {
            dataObject["days"][dateKey]["scopeChangeCompletion"]["points"][
              "count"
            ] += parseInt(issue.fields[jira_points]);
          }
        }

        // Add issue to week object
        const closedDate = new Date(dateData.date);
        let closedMonthDay = closedDate.getDate();
        if (closedDate.getDay() !== 0) {
          closedMonthDay = closedMonthDay - closedDate.getDay();
        }
        const closedWeek = new Date(
          closedDate.getFullYear(),
          closedDate.getMonth(),
          closedMonthDay
        );
        const closedWeekKey = closedWeek.toJSON().slice(0, 10);
        if (dataObject["weeks"][closedWeekKey] !== undefined) {
          dataObject["weeks"][closedWeekKey]["completion"]["issues"]["count"]++;
          dataObject["weeks"][closedWeekKey]["completion"]["list"].push(issue);
          if (
            issue.fields[jira_points] !== undefined &&
            issue.fields[jira_points] !== null
          ) {
            dataObject["weeks"][closedWeekKey]["completion"]["points"][
              "count"
            ] += parseInt(issue.fields[jira_points]);
          }

          //Calculating if scope changed for this issue
          if (
            issue.fields.labels.filter(
              label =>
                this.stringClean(label) === this.stringClean("Scope Change")
            ).length !== 0
          ) {
            dataObject["weeks"][closedWeekKey]["scopeChangeCompletion"][
              "issues"
            ]["count"]++;
            dataObject["weeks"][closedWeekKey]["scopeChangeCompletion"][
              "list"
            ].push(issue);
            if (
              issue.fields[jira_points] !== undefined &&
              issue.fields[jira_points] !== null
            ) {
              dataObject["weeks"][closedWeekKey]["scopeChangeCompletion"][
                "points"
              ]["count"] += parseInt(issue.fields[jira_points]);
            }
          }
        }
      }
    }
    return dataObject;
  };

  /*
    Returns a list of issues completed on a particular day, either from cache of by fetching a new batch
  */
  getCompletedIssues = async (dateToFetch, jira_jql_completion) => {
    const issues = [];
    const cacheDir = this.config.configDir + "/cache/";
    if (
      !fs.existsSync(
        path.join(cacheDir, "completed-" + dateToFetch + ".ndjson")
      )
    ) {
      cli.action.start(
        "Fetching data for day: " +
          dateToFetch +
          " to file: " +
          path.join(cacheDir, "completed-" + dateToFetch + ".ndjson")
      );

      const jqlQuery = jira_jql_completion + " ON(" + dateToFetch + ")";
      const jiraConnection = await this.getJiraConnection();
      const issuesJira = await jiraSearchIssues(jiraConnection, jqlQuery);
      //const issuesJira = await this.fetchDataFromJira(jqlQuery);
      //Note: We'd still write an empty file to cache to record the fact that no issues were completed that day
      const issueFileStream = fs.createWriteStream(
        path.join(cacheDir, "completed-" + dateToFetch + ".ndjson"),
        { flags: "a" }
      );
      if (issuesJira.length > 0) {
        for (let issue of issuesJira) {
          issueFileStream.write(JSON.stringify(issue) + "\n");
          issues.push(issue);
        }
      }
      issueFileStream.end();
      cli.action.stop(" done");
    } else {
      const input = fs.createReadStream(
        path.join(cacheDir, "completed-" + dateToFetch + ".ndjson")
      );
      for await (const line of this.readLines(input)) {
        issues.push(JSON.parse(line));
      }
    }
    return issues;
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

  stringClean = labelName => {
    return String(labelName)
      .replace(/[^a-z0-9+]+/gi, "")
      .toLowerCase();
  };
}

export const calculateAverageVelocity = (array, category, indexValue) => {
  return array
    .map(values => values[category][indexValue]["count"])
    .reduce((accumulator, currentValue, currentIndex, array) => {
      accumulator += currentValue;
      if (currentIndex === array.length - 1) {
        return accumulator / array.length;
      } else {
        return accumulator;
      }
    });
};

export const formatDate = dateString => {
  let day = new Date(dateString);
  day.setUTCHours(12);
  day.setUTCMinutes(0);
  day.setUTCSeconds(0);
  return day;
};
