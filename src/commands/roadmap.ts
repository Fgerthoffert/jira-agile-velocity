import { flags } from "@oclif/command";
import cli from "cli-ux";
import * as fs from "fs";
import * as loadYamlFile from "load-yaml-file";
import * as path from "path";

import * as SymbolTree from "symbol-tree";

import { ICalendar, ICalendarFinal } from "../global";
import Command from "../base";
import jiraSearchIssues from "../utils/jira/searchIssues";

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

  /*
    Returns a configuration object to be used when connecting to Jira
  */
  async getJiraConnection() {
    const { flags } = this.parse(Roadmap);
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
    const { flags } = this.parse(Roadmap);
    const userConfig = await loadYamlFile(
      path.join(this.config.configDir, "config.yml")
    );
    let {
      env_jira_roadmap_jql,
      env_jira_roadmap_pointstype,
      env_jira_points
    } = flags;
    const jira_roadmap_jql: string =
      env_jira_roadmap_jql !== undefined
        ? env_jira_roadmap_jql
        : userConfig.jira.roadmapJql;
    const jira_roadmap_pointstype: string =
      env_jira_roadmap_pointstype !== undefined
        ? env_jira_roadmap_pointstype
        : userConfig.jira.roadmapPointstype;
    const jira_points: string =
      env_jira_points !== undefined
        ? env_jira_points
        : userConfig.jira.pointsField;

    const initiativesIssues = await this.fetchInitiatives(jira_roadmap_jql);

    const tree = new SymbolTree();
    const root = {};

    // Feed the children into the initiative
    const initiatives = [];
    for (let initiative of initiativesIssues) {
      tree.appendChild(root, initiative);
      const children = await this.fetchChildIssues(initiative.key);
      console.log(initiative.key + " - " + initiative.fields.summary);
      for (let child of children.filter(
        ic => ic.fields["customfield_11112"] === initiative.key
      )) {
        console.log(child.key + " - " + child.fields.summary);
        tree.appendChild(initiative, child);
      }
      /*
      const pointChildren = children.filter(
        (issue: any) => issue.fields.issuetype.name === "Story"
      );
      */
      initiatives.push({
        ...initiative,
        children
        /*
        progress: {
          issues: { open: 0, closed: 0, total: 0 },
          points: {
            open: pointChildren
              .filter(
                (issue: any) =>
                  issue.fields.status.statusCategory.key !== "done"
              )
              .map((issue: any) => issue.fields[jira_points])
              .reduce((acc: number, points: number) => acc + points, 0),
            closed: pointChildren
              .filter(
                (issue: any) =>
                  issue.fields.status.statusCategory.key !== "done"
              )
              .map((issue: any) => issue.fields[jira_points])
              .reduce((acc: number, points: number) => acc + points, 0),
            total: 0
          },
          missingPoints: pointChildren.filter(
            (issue: any) =>
              issue.fields[jira_points] === undefined ||
              issue.fields[jira_points] === null
          ).length
        }*/
      });
    }
    console.log(initiatives);
    console.log(JSON.stringify(tree.treeToArray(root)));
    //Note: Parent field (if parent is EPIC): customfield_10314
    //Note: Parent field (if parent is INITIATIVE): customfield_11112

    const initiativesTable = [];
    for (let issue of initiatives) {
      initiativesTable.push({
        prefix: "-----",
        key: issue.key,
        title: issue.fields.summary,
        state: issue.fields.status.name,
        type: issue.fields.issuetype.name,
        /*
        progress:
          issue.progress.points.open +
          " / " +
          (issue.progress.points.open + issue.progress.points.closed),
          */
        progress: "",
        start: "",
        endActual: "",
        endForecast: ""
      });
      if (issue.children !== undefined) {
        for (let issueChild of issue.children.filter(
          ic => ic.fields["customfield_11112"] === issue.key
        )) {
          initiativesTable.push({
            prefix: " |---",
            key: issueChild.key,
            title: issueChild.fields.summary,
            state: issueChild.fields.status.name,
            type: issueChild.fields.issuetype.name,
            progress: "",
            start: "",
            endActual: "",
            endForecast: ""
          });
          for (let issueChildChild of issue.children.filter(
            ic => ic.fields["customfield_10314"] === issueChild.key
          )) {
            initiativesTable.push({
              prefix: " | |-",
              key: issueChildChild.key,
              title: issueChildChild.fields.summary,
              state: issueChildChild.fields.status.name,
              type: issueChildChild.fields.issuetype.name,
              progress: "",
              start: "",
              endActual: "",
              endForecast: ""
            });
          }
        }
      }
    }

    this.showConsoleTable(initiativesTable);

    const cacheDir = this.config.configDir + "/cache/";
    const issueFileStream = fs.createWriteStream(
      path.join(cacheDir, "roadmap-artifact.json"),
      { flags: "w" }
    );
    issueFileStream.write(JSON.stringify(initiatives));
    issueFileStream.end();
  }

  /*
    Fetch initiatives from Jira
  */
  fetchInitiatives = async (jira_roadmap_jql: string) => {
    cli.action.start(
      "Fetching roadmap initiatives using: " + jira_roadmap_jql + " "
    );
    const jiraConnection = await this.getJiraConnection();
    const issuesJira = await jiraSearchIssues(
      jiraConnection,
      jira_roadmap_jql,
      "summary,status,labels,customfield_10114,issuetype"
    );
    cli.action.stop(" done");
    return issuesJira;
  };
  /*
    Fetch initiatives from Jira
  */
  fetchChildIssues = async (issuekey: string) => {
    cli.action.start("Fetching children of: " + issuekey + " ");
    const jiraConnection = await this.getJiraConnection();
    const issuesJira = await jiraSearchIssues(
      jiraConnection,
      "issuekey in childIssuesOf(" + issuekey + ")",
      "summary,status,labels,customfield_10114,issuetype,customfield_10314,customfield_11112"
    );
    cli.action.stop(" done");
    return issuesJira;
  };

  showConsoleTable = async (issues: any) => {
    const columns: any = {
      prefix: {
        header: "-"
      },
      key: {
        header: "Key",
        minWidth: "10"
      },
      title: {
        header: "Title",
        minWidth: "10"
      },
      state: {
        header: "State",
        minWidth: "10"
      },
      type: {
        header: "Type",
        minWidth: "10"
      },
      progress: {
        header: "Progress (Open / Total / %)",
        minWidth: "5"
      },
      missing: {
        header: "Missing Estimates",
        minWidth: "5"
      },
      start: {
        header: "Start",
        minWidth: "10"
      },
      endActual: {
        header: "End (Actual)",
        minWidth: "10"
      },
      endForecast: {
        header: "End (Forecast)",
        minWidth: "10"
      }
    };
    const options: any = {
      columns: true
    };
    cli.table(issues, columns);
  };
}
