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
import crunchRoadmap from '../utils/initiatives/crunchRoadmap';
import getEmptyCalendar from '../utils/initiatives/getEmptyCalendar';
import getEmptyRoadmap from '../utils/initiatives/getEmptyRoadmap';
import prepareInitiativesData from '../utils/initiatives/prepareInitiativesData';
import prepareOrphanIssues from '../utils/initiatives/prepareOrphanIssues';
import teamVelocityFromCache from '../utils/roadmap/teamVelocityFromCache';
import { exportTree } from '../utils/misc/treeUtils';
import optimizePayload from '../utils/initiatives/optimizePayload';

export default class Roadmap extends Command {
  static description = 'Builds a roadmap from a set of issues';

  static flags = {
    ...Command.flags,
    help: flags.help({ char: 'h' }),
    type: flags.string({
      char: 't',
      description: 'Use issues of points for metrics',
      options: ['issues', 'points'],
      default: 'points',
    }),
    cache: flags.boolean({
      char: 'c',
      description:
        'Use cached version of the child issues (mostly useful for dev)',
      default: false,
    }),
  };

  async run() {
    const { flags } = this.parse(Roadmap);
    // eslint-disable-next-line
    let { type, cache } = flags;
    const userConfig = this.userConfig;
    const cacheDir = this.config.configDir + '/cache/';
    if (cache) {
      this.log(
        '==================================================================================',
      );
      this.log(
        'Will be fetching data from cache. NO CALLS WILL BE MADE TO JIRA TO REFRESH DATA ',
      );
      this.log(
        '==================================================================================',
      );
    }

    // Creates an array of all closed issues across all teams
    // this is needed to identify which issues have been closed but are not assigned to an initiative
    // This also filters out to only issues listed in the roadmap.teams section, to avoid catch-all rules and issues from being counted twice
    let closedIssues: Array<IJiraIssue> = [];
    for (const team of userConfig.teams.filter(
      (t: any) =>
        userConfig.roadmap.teams.find(
          (teamName: string) => t.name === teamName,
        ) !== undefined,
    )) {
      const teamIssues = await fetchCompleted(
        userConfig,
        this.config.configDir + '/cache/',
        team.name,
      );
      // Merge the two arrays but filter out tickets already present (i.e that could be obtained by different queries)
      closedIssues = [
        ...closedIssues,
        ...teamIssues.filter(
          (tIssue: any) =>
            closedIssues.find((cIssue: any) => cIssue.key === tIssue.key) ===
            undefined,
        ),
      ];
    }
    this.log('Number of issues closed in the period: ' + closedIssues.length);

    // Build an empty weekly calendar, from the first closed issue to the last closed issue
    const emptyCalendar = getEmptyCalendar(closedIssues, userConfig);

    const velocityTeamCache = await teamVelocityFromCache(userConfig, cacheDir);
    this.log(
      'Fetched velocity metrics for ' + velocityTeamCache.length + ' teams',
    );

    // Fetch all initiatives and its children
    const initiativesIssues = await fetchInitiatives(
      userConfig,
      cacheDir,
      cache,
    );
    this.log('Number of initiatives fetched: ' + initiativesIssues.length);

    // Fetch all of the initiatives children and build a tree
    const issuesTree = new SymbolTree();
    const treeRoot = {};
    for (const initiative of initiativesIssues) {
      issuesTree.appendChild(treeRoot, initiative);
      const children = await fetchChildren(
        userConfig,
        initiative.key,
        cacheDir,
        cache,
      );
      for (const l1child of children.filter(
        (ic: any) =>
          ic.fields[userConfig.jira.fields.parentInitiative] === initiative.key,
      )) {
        issuesTree.appendChild(initiative, l1child);
        for (const l2child of children.filter(
          (ic: any) =>
            ic.fields[userConfig.jira.fields.parentEpic] === l1child.key,
        )) {
          issuesTree.appendChild(l1child, l2child);
        }
      }
    }

    cli.action.start('Preparing metrics for all initiatives in the tree ');
    // Update the tree with completion and week by week metrics
    prepareInitiativesData(
      issuesTree,
      treeRoot,
      0,
      closedIssues,
      emptyCalendar,
      userConfig,
    );
    cli.action.stop(' done');

    cli.action.start('Creating an export payload');
    const rawInitiativesTree = exportTree(issuesTree, treeRoot);
    cli.action.stop(' done');

    cli.action.start('Preparing orphan issues');
    //Get an array of all orphaned issues
    const orphanIssues = prepareOrphanIssues(
      issuesTree,
      treeRoot,
      closedIssues,
    );
    //Add orphaned issues to a weekly calendar
    const orphanWeekly = emptyCalendar.map((week: any) => {
      const weekIssues = orphanIssues.filter(
        (issue: any) => week.weekStart === issue.weekStart,
      );
      return {
        ...week,
        list: weekIssues,
        issues: {
          count: weekIssues.length,
        },
        points: {
          count: weekIssues
            .map((issue: any) => issue.points)
            .reduce((acc: number, points: number) => acc + points, 0),
        },
      };
    });
    cli.action.stop(' done');

    cli.action.start('Forecasting future completion');
    const emptyRoadmap = getEmptyRoadmap(
      emptyCalendar[emptyCalendar.length - 1],
      // tslint:disable-next-line: strict-type-predicates
      userConfig.roadmap.forecastWeeks !== undefined
        ? userConfig.roadmap.forecastWeeks
        : 26,
    );
    const futureCompletion = crunchRoadmap(
      emptyRoadmap,
      velocityTeamCache,
      rawInitiativesTree,
    );
    cli.action.stop(' done');

    const rawInitiativesArtifact = {
      updatedAt: new Date().toJSON(),
      host: userConfig.jira.host,
      calendar: {
        completed: emptyCalendar,
        roadmap: emptyRoadmap,
      },
      initiatives: rawInitiativesTree,
      orphanIssues: orphanWeekly,
      futureCompletion: futureCompletion,
    };

    cli.action.start('Optimizing payload for frontend');
    const slimInitiativesArtifact = optimizePayload(rawInitiativesArtifact);
    cli.action.stop(' done');

    // Export data to file
    const initiativesRawFileStream = fs.createWriteStream(
      path.join(cacheDir, 'initiatives-artifacts-raw.json'),
      { flags: 'w' },
    );
    initiativesRawFileStream.write(JSON.stringify(rawInitiativesArtifact));
    initiativesRawFileStream.end();

    const initiativesSlimFileStream = fs.createWriteStream(
      path.join(cacheDir, 'initiatives-artifacts.json'),
      { flags: 'w' },
    );
    initiativesSlimFileStream.write(JSON.stringify(slimInitiativesArtifact));
    initiativesSlimFileStream.end();
  }
}
