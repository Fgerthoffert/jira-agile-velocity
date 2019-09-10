import { flags } from '@oclif/command';
import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import * as SymbolTree from 'symbol-tree';

import Command from '../base';
import { IJiraIssue } from '../global';
import fetchChildren from '../utils/data/fetchChildren';
import fetchCompleted from '../utils/data/fetchCompleted';
import fetchInitiatives from '../utils/data/fetchInitiatives';
import getEmptyCalendarObject from '../utils/roadmap/getEmptyCalendarObject';
import getEmptyRoadmapObject from '../utils/roadmap/getEmptyRoadmapObject';
import prepareInitiativesData from '../utils/roadmap/prepareInitiativesData';
import teamClosedByWeek from '../utils/roadmap/teamClosedByWeek';
import crunchRoadmap from '../utils/roadmap/crunchRoadmap';
import teamVelocityFromCache from '../utils/roadmap/teamVelocityFromCache';

export default class Roadmap extends Command {
  static description = 'Builds a roadmap from a set of issues';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    type: flags.string({
      char: 't',
      description: 'Use issues of points for metrics',
      options: ['issues', 'points'],
      default: 'points'
    }),
    cache: flags.boolean({
      char: 'c',
      description:
        'Use cached version of the child issues (mostly useful for dev)',
      default: false
    })
  };

  async run() {
    const { flags } = this.parse(Roadmap);
    let { type, cache } = flags;
    const userConfig = this.userConfig;
    const cacheDir = this.config.configDir + '/cache/';
    if (cache) {
      this.log(
        '=================================================================================='
      );
      this.log(
        'Will be fetching data from cache. NO CALLS WILL BE MADE TO JIRA TO REFRESH DATA '
      );
      this.log(
        '=================================================================================='
      );
    }
    // Creates an array of all closed issues across all teams
    let closedIssues: Array<IJiraIssue> = [];
    for (let team of userConfig.teams) {
      const teamIssues = await fetchCompleted(
        userConfig,
        this.config.configDir + '/cache/',
        team.name
      );
      closedIssues = [...closedIssues, ...teamIssues];
    }

    const emptyCalendar = getEmptyCalendarObject(closedIssues, userConfig);
    const velocityTeamCache = await teamVelocityFromCache(userConfig, cacheDir);
    const closedIssuesByWeekAndTeam = teamClosedByWeek(
      closedIssues,
      userConfig,
      emptyCalendar,
      velocityTeamCache
    );

    const initiativesIssues = await fetchInitiatives(
      userConfig,
      cacheDir,
      cache
    );

    // Structure the issues in an actual tree object for easier traversing
    //Note: Parent field (if parent is EPIC): customfield_10314
    //Note: Parent field (if parent is INITIATIVE): customfield_11112
    const issuesTree = new SymbolTree();
    const treeRoot = {};
    for (let initiative of initiativesIssues) {
      issuesTree.appendChild(treeRoot, initiative);
      const children = await fetchChildren(
        userConfig,
        initiative.key,
        cacheDir,
        cache
      );
      for (let l1child of children.filter(
        (ic: any) =>
          ic.fields[userConfig.jira.fields.parentInitiative] === initiative.key
      )) {
        issuesTree.appendChild(initiative, l1child);
        for (let l2child of children.filter(
          (ic: any) =>
            ic.fields[userConfig.jira.fields.parentEpic] === l1child.key
        )) {
          issuesTree.appendChild(l1child, l2child);
        }
      }
    }

    // Update all of the tree nodes with actual metrics
    prepareInitiativesData(
      issuesTree,
      treeRoot,
      0,
      closedIssues,
      emptyCalendar,
      userConfig
    );

    const closedIssuesByWeekAndInitiative = this.exportData(
      issuesTree,
      treeRoot
    );

    const lastCalendarWeek = Object.values(emptyCalendar)[
      Object.values(emptyCalendar).length - 1
    ];
    const emptyRoadmap = getEmptyRoadmapObject(
      lastCalendarWeek,
      // tslint:disable-next-line: strict-type-predicates
      userConfig.roadmap.forecaseWeeks !== undefined
        ? userConfig.roadmap.forecaseWeeks
        : 26
    );
    const futureCompletion = crunchRoadmap(
      emptyRoadmap,
      closedIssuesByWeekAndTeam,
      closedIssuesByWeekAndInitiative
    );

    // FINAL STAGE
    const roadmapArtifact = {
      byTeam: closedIssuesByWeekAndTeam,
      byInitiative: closedIssuesByWeekAndInitiative,
      byFutureInitiative: futureCompletion
    };

    this.showArtifactsTable(roadmapArtifact, type);

    const issueFileStream = fs.createWriteStream(
      path.join(cacheDir, 'roadmap-artifacts.json'),
      { flags: 'w' }
    );
    issueFileStream.write(JSON.stringify(roadmapArtifact));
    issueFileStream.end();
  }

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

  showArtifactsTable = (roadmapArtifact: any, type: string) => {
    const columnsByTeam: any = {
      name: {
        header: 'Team',
        minWidth: '10',
        get: (row: any) => {
          if (row.name === null) {
            return 'TOTAL';
          }
          return row.name;
        }
      }
    };
    for (let week of roadmapArtifact.byTeam[0].weeks) {
      const weekId = week.weekStart.slice(0, 10);
      columnsByTeam[weekId] = { header: weekId };
    }
    this.log('');

    this.log(
      '==========================PAST COMPLETION BY TEAM==================================='
    );
    cli.table(
      roadmapArtifact.byTeam.map((team: any) => {
        const teamData = { ...team };
        for (let week of team.weeks) {
          const weekId = week.weekStart.slice(0, 10);
          teamData[weekId] = week[type].count;
        }
        return teamData;
      }),
      columnsByTeam
    );
    this.log('');
    this.log(
      '==========================PAST COMPLETION BY INITIATIVE========================================================'
    );

    const columnsByInitiative: any = {
      prefix: {
        header: '-',
        get: (row: any) => {
          switch (row.level) {
            case 1:
              return '-----';
            case 2:
              return ' |---';
            case 3:
              return ' | |-';
          }
        }
      },
      type: {
        header: 'Type',
        minWidth: '10',
        get: (row: any) => {
          return row.fields.issuetype.name;
        }
      },
      key: {
        header: 'Key'
      },
      title: {
        header: 'Title',
        get: (row: any) => {
          return row.fields.summary;
        }
      },
      state: {
        header: 'State',
        minWidth: '10',
        get: (row: any) => {
          return row.fields.status.statusCategory.name;
        }
      },
      pts: {
        header: 'Pts',
        get: (row: any) => {
          if (row.isLeaf) {
            if (row.metrics.missingPoints) {
              return '-';
            }
            return row.metrics[type].total;
          }
          return '';
        }
      },
      progress: {
        header: 'Progress',
        minWidth: '5',
        get: (row: any) => {
          if (!row.isLeaf) {
            let progress = '0%';
            let missing = '';
            if (row.metrics[type].missing > 0) {
              missing =
                ' (' +
                row.metrics[type].missing +
                ' open issues without estimate)';
            }
            if (row.metrics[type].total > 0) {
              progress =
                Math.round(
                  ((row.metrics[type].completed * 100) /
                    row.metrics[type].total) *
                    100
                ) /
                  100 +
                '%';
            }
            return (
              row.metrics[type].completed +
              '/' +
              row.metrics[type].total +
              ' - ' +
              progress +
              missing
            );
          }
          return '';
        }
      }
    };
    for (let week of roadmapArtifact.byInitiative[0].weeks) {
      const weekId = week.weekStart.slice(0, 10);
      columnsByInitiative[weekId] = { header: weekId };
    }
    cli.table(
      roadmapArtifact.byInitiative.map((initiative: any) => {
        const initiativeData = { ...initiative };
        for (let week of initiative.weeks) {
          const weekId = week.weekStart.slice(0, 10);
          initiativeData[weekId] = week[type].count;
        }
        return initiativeData;
      }),
      columnsByInitiative
    );
    this.log('');
    this.log(
      '==========================FUTURE COMPLETION BY INITIATIVE========================================================'
    );
    const columnsFuture: any = {
      type: {
        header: 'Type',
        minWidth: '10',
        get: (row: any) => {
          return row.fields.issuetype.name;
        }
      },
      key: {
        header: 'Key'
      },
      title: {
        header: 'Title',
        get: (row: any) => {
          return row.fields.summary;
        }
      },
      state: {
        header: 'State',
        minWidth: '10',
        get: (row: any) => {
          return row.fields.status.statusCategory.name;
        }
      },
      pts: {
        header: 'Team',
        get: (row: any) => {
          return row.team.name;
        }
      },
      completed: {
        header: 'Completed',
        get: (row: any) => {
          return row.metrics.points.completed;
        }
      },
      remaining: {
        header: 'Remaining',
        get: (row: any) => {
          return row.metrics.points.remaining;
        }
      },
      velocity: {
        header: 'Velocity',
        get: (row: any) => {
          return row.team.velocity.points.current;
        }
      }
    };
    if (roadmapArtifact.byFutureInitiative.length > 0) {
      for (let week of roadmapArtifact.byFutureInitiative[0].weeks) {
        const weekId = week.weekStart.slice(0, 10);
        columnsFuture[weekId] = { header: weekId };
      }
    }

    cli.table(
      roadmapArtifact.byFutureInitiative.map((initiative: any) => {
        const initiativeData = { ...initiative };
        for (let week of initiative.weeks) {
          const weekId = week.weekStart.slice(0, 10);
          initiativeData[weekId] = week[type].count;
        }
        return initiativeData;
      }),
      columnsFuture
    );
  };
}
