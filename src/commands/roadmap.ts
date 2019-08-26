import { flags } from "@oclif/command";
import cli from "cli-ux";
import * as fs from "fs";
import * as loadYamlFile from "load-yaml-file";
import * as path from "path";
import * as readline from "readline";
import * as stream from "stream";

import * as SymbolTree from "symbol-tree";

import { ICalendar, ICalendarFinal, IConfig, IJiraIssue } from "../global";
import Command from "../base";
import jiraSearchIssues from "../utils/jira/searchIssues";
import fetchCompleted from "../utils/data/fetchCompleted";
import { getWeeksBetweenDates, formatDate } from "../utils/misc/dateUtils";
import closedByWeek from "../utils/roadmap/closedByWeek";

import { NOTINITIALIZED } from "dns";

export default class Roadmap extends Command {
  static description = "Build a roadmap from a set of issues";

  static flags = {
    ...Command.flags,
    help: flags.help({ char: "h" }),
    type: flags.string({
      char: "t",
      description: "Use issues of points for metrics",
      options: ["issues", "points"],
      default: "points"
    }),
    cache: flags.boolean({
      char: "c",
      description:
        "Use cached version of the child issues (mostly useful for dev)",
      default: false
    })
  };

  async run() {
    const { flags } = this.parse(Roadmap);
    let { type, cache } = flags;
    const userConfig = this.userConfig;
    const cacheDir = this.config.configDir + "/cache/";

    // Fetch all closed issues into an array
    let closedIssues: Array<IJiraIssue> = [];
    for (let team of userConfig.teams) {
      const teamIssues = await fetchCompleted(
        userConfig,
        this.config.configDir + "/cache/",
        team.name
      );
      closedIssues = [...closedIssues, ...teamIssues];
    }

    const closedIssuesByWeek = closedByWeek(closedIssues);

    const initiativesIssues = await this.fetchInitiatives(userConfig);

    const issuesTree = new SymbolTree();
    const treeRoot = {};

    for (let initiative of initiativesIssues) {
      issuesTree.appendChild(treeRoot, initiative);
      const children = await this.fetchChildIssues(
        userConfig,
        initiative.key,
        cache
      );
      for (let l1child of children.filter(
        (ic: any) => ic.fields["customfield_11112"] === initiative.key
      )) {
        issuesTree.appendChild(initiative, l1child);
        for (let l2child of children.filter(
          (ic: any) => ic.fields["customfield_10314"] === l1child.key
        )) {
          issuesTree.appendChild(l1child, l2child);
        }
      }
    }
    //Note: Parent field (if parent is EPIC): customfield_10314
    //Note: Parent field (if parent is INITIATIVE): customfield_11112

    const issuesData = this.prepareData(issuesTree, treeRoot, 0);

    const issuesWithWeeks = this.appendWeeks(
      issuesTree,
      treeRoot,
      closedIssuesByWeek,
      userConfig
    );

    const exportData = this.exportData(issuesTree, treeRoot);
    const issueWeekFileStream = fs.createWriteStream(
      path.join(cacheDir, "roadmap-weeks.json"),
      { flags: "w" }
    );
    issueWeekFileStream.write(JSON.stringify(exportData));
    issueWeekFileStream.end();

    const issuesTable = this.prepareTable(issuesTree, treeRoot, []);
    this.showConsoleTable(issuesTable);

    const issueFileStream = fs.createWriteStream(
      path.join(cacheDir, "roadmap-artifact.json"),
      { flags: "w" }
    );
    issueFileStream.write(JSON.stringify(issuesTable));
    issueFileStream.end();
  }

  appendWeeks = (
    issuesTree: any,
    node: any,
    closedIssuesByWeek: Array<any>,
    userConfig: IConfig
  ) => {
    if (node.key !== undefined) {
      console.log(
        node.key + " children: " + issuesTree.treeToArray(node).length
      );
      node.completionWeeks = closedIssuesByWeek.map(week => {
        const completedIssues = week.list.filter(i => {
          // Search issue in this list: issuesTree.treeToArray(node).length
          //            console.log(i);
          if (
            issuesTree.treeToArray(node).find(n => n.key === i.key) !==
            undefined
          ) {
            console.log(
              "Found: " + node.key + " completed in week: " + week.weekStart
            );
            return true;
          }
          return false;
        });

        return {
          ...week,
          list: completedIssues,
          issues: { count: completedIssues.length },
          points: {
            count: completedIssues
              .map(
                (issue: IJiraIssue) => issue.fields[userConfig.jira.pointsField]
              )
              .reduce((acc: number, points: number) => acc + points, 0)
          }
        };
      });
    }
    for (const children of issuesTree.childrenIterator(node)) {
      this.appendWeeks(issuesTree, children, closedIssuesByWeek, userConfig);
    }
    return [];
  };

  prepareData = (issuesTree: any, node: any, level: number) => {
    if (node.key !== undefined) {
      node.level = level;
      node.metrics = this.crunchMetrics(issuesTree, node);
      node.isLeaf = issuesTree.hasChildren(node) ? false : true;
    }
    for (const children of issuesTree.childrenIterator(node)) {
      this.prepareData(issuesTree, children, level + 1);
    }
    return [];
  };

  exportData = (issuesTree: any, node: any) => {
    const jsonObject = [];
    for (const initiative of issuesTree.childrenIterator(node)) {
      const epics = [];
      for (const epic of issuesTree.childrenIterator(initiative)) {
        const stories = [];
        for (const story of issuesTree.childrenIterator(epic)) {
          stories.push(story);
        }
        epic.children = stories;
        epics.push(epic);
      }
      initiative.children = epics;
      jsonObject.push(initiative);
    }
    return jsonObject;
  };

  crunchMetrics = (issuesTree: any, node: any) => {
    return issuesTree.treeToArray(node).reduce(
      (acc: any, item: any) => {
        if (parseInt(item.fields.customfield_10114, 10) > 0) {
          acc.points.total =
            acc.points.total + parseInt(item.fields.customfield_10114, 10);
          if (item.fields.status.statusCategory.name === "Done") {
            acc.points.completed =
              acc.points.completed +
              parseInt(item.fields.customfield_10114, 10);
          } else {
            acc.points.remaining =
              acc.points.remaining +
              parseInt(item.fields.customfield_10114, 10);
          }
        }
        if (
          (item.fields.customfield_10114 === undefined ||
            item.fields.customfield_10114 === null) &&
          issuesTree.hasChildren(node) === false
        ) {
          acc.missingPoints = true;
        }
        if (
          (item.fields.customfield_10114 === undefined ||
            item.fields.customfield_10114 === null) &&
          issuesTree.hasChildren(item) === false &&
          item.fields.status.statusCategory.name !== "Done"
        ) {
          acc.points.missing++;
        }
        acc.issues.total = acc.issues.total + 1;
        if (item.fields.status.statusCategory.name === "Done") {
          acc.issues.completed++;
        } else {
          acc.issues.remaining++;
        }
        return acc;
      },
      {
        missingPoints: false,
        points: { total: 0, completed: 0, remaining: 0, missing: 0 },
        issues: { total: 0, completed: 0, remaining: 0 }
      }
    );
  };

  prepareTable = (issuesTree: any, node: any, issuesTable: Array<any>) => {
    if (node.key !== undefined) {
      issuesTable.push(node);
    }
    //    console.log(node);
    //    console.log("----");

    for (const children of issuesTree.childrenIterator(node)) {
      this.prepareTable(issuesTree, children, issuesTable);
    }
    return issuesTable;
  };

  /*
    Fetch initiatives from Jira
  */
  fetchInitiatives = async (userConfig: IConfig) => {
    cli.action.start(
      "Fetching roadmap initiatives using: " +
        userConfig.roadmap.jqlInitiatives +
        " "
    );

    const issuesJira = await jiraSearchIssues(
      userConfig.jira,
      userConfig.roadmap.jqlInitiatives,
      "summary,status,labels," + userConfig.jira.pointsField + ",issuetype"
    );
    cli.action.stop(" done");
    return issuesJira;
  };
  /*
    Fetch initiatives from Jira
  */
  fetchChildIssues = async (
    userConfig: IConfig,
    issuekey: string,
    cache: boolean
  ) => {
    cli.action.start("Fetching children of: " + issuekey + " ");
    let issuesJira = [];
    const childIssuesCache = path.join(
      this.config.configDir + "/cache/",
      "childissuescache-" + issuekey + ".ndjson"
    );
    if (cache && fs.existsSync(childIssuesCache)) {
      const input = fs.createReadStream(childIssuesCache);
      for await (const line of readLines(input)) {
        issuesJira.push(JSON.parse(line));
      }
    } else {
      let issuesJira = await jiraSearchIssues(
        userConfig.jira,
        "issuekey in childIssuesOf(" + issuekey + ")",
        "summary,status,labels," +
          userConfig.jira.pointsField +
          ",issuetype,customfield_10314,customfield_11112"
      );
      if (cache) {
        const issueFileStream = fs.createWriteStream(childIssuesCache, {
          flags: "a"
        });
        if (issuesJira.length > 0) {
          for (let issue of issuesJira) {
            issueFileStream.write(JSON.stringify(issue) + "\n");
          }
        }
        issueFileStream.end();
      }
    }
    cli.action.stop(" done");
    return issuesJira;
  };

  showConsoleTable = (issues: any) => {
    const columns: any = {
      prefix: {
        header: "-",
        get: (row: any) => {
          switch (row.level) {
            case 1:
              return "-----";
            case 2:
              return " |---";
            case 3:
              return " | |-";
          }
        }
      },
      type: {
        header: "Type",
        minWidth: "10",
        get: (row: any) => {
          return row.fields.issuetype.name;
        }
      },
      key: {
        header: "Key"
      },
      title: {
        header: "Title",
        get: (row: any) => {
          return row.fields.summary;
        }
      },
      state: {
        header: "State",
        minWidth: "10",
        get: (row: any) => {
          return row.fields.status.statusCategory.name;
        }
      },
      pts: {
        header: "Pts",
        get: (row: any) => {
          if (row.isLeaf) {
            if (row.metrics.missingPoints) {
              return "-";
            }
            return row.metrics.points.total;
          }
          return "";
        }
      },
      progress: {
        header: "Progress",
        minWidth: "5",
        get: (row: any) => {
          if (!row.isLeaf) {
            let progress = "0%";
            let missing = "";
            if (row.metrics.points.missing > 0) {
              missing =
                " (" +
                row.metrics.points.missing +
                " open issues without estimate)";
            }
            if (row.metrics.points.total > 0) {
              progress =
                Math.round(
                  ((row.metrics.points.completed * 100) /
                    row.metrics.points.total) *
                    100
                ) /
                  100 +
                "%";
            }
            return (
              row.metrics.points.completed +
              "/" +
              row.metrics.points.total +
              " - " +
              progress +
              missing
            );
          }
          return "";
        }
      }
    };
    const options: any = {
      columns: true
    };
    cli.table(issues, columns);
  };
}

//https://medium.com/@wietsevenema/node-js-using-for-await-to-read-lines-from-a-file-ead1f4dd8c6f
const readLines = (input: any) => {
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
