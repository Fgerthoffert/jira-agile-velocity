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
import crunchRoadmap from '../utils/roadmap/crunchRoadmap';
import getEmptyCalendarObject from '../utils/roadmap/getEmptyCalendarObject';
import getEmptyRoadmapObject from '../utils/roadmap/getEmptyRoadmapObject';
import prepareInitiativesData from '../utils/initiatives/prepareInitiativesData';
import teamClosedByWeek from '../utils/roadmap/teamClosedByWeek';
import teamVelocityFromCache from '../utils/roadmap/teamVelocityFromCache';
import { isUndefined } from 'util';

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
    // eslint-disable-next-line
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
    // this is needed to identify which issues have been closed but are not assigned to an initiative
    let closedIssues: Array<IJiraIssue> = [];
    for (const team of userConfig.teams) {
      const teamIssues = await fetchCompleted(
        userConfig,
        this.config.configDir + '/cache/',
        team.name
      );
      closedIssues = [...closedIssues, ...teamIssues];
    }
    const emptyCalendar = getEmptyCalendarObject(closedIssues, userConfig);

    // Fetch all initiatives and its children
    const initiativesIssues = await fetchInitiatives(
      userConfig,
      cacheDir,
      cache
    );

    // Fetch all of the initiatives children and build a tree
    const issuesTree = new SymbolTree();
    const treeRoot = {};
    for (const initiative of initiativesIssues) {
      issuesTree.appendChild(treeRoot, initiative);
      const children = await fetchChildren(
        userConfig,
        initiative.key,
        cacheDir,
        cache
      );
      for (const l1child of children.filter(
        (ic: any) =>
          ic.fields[userConfig.jira.fields.parentInitiative] === initiative.key
      )) {
        issuesTree.appendChild(initiative, l1child);
        for (const l2child of children.filter(
          (ic: any) =>
            ic.fields[userConfig.jira.fields.parentEpic] === l1child.key
        )) {
          issuesTree.appendChild(l1child, l2child);
        }
      }
    }
    console.log(issuesTree);

    // Update all of the tree nodes with actual metrics
    prepareInitiativesData(
      issuesTree,
      treeRoot,
      0,
      closedIssues,
      emptyCalendar,
      userConfig
    );

    const initiativeArtifact = {
      updatedAt: new Date().toJSON(),
      host: userConfig.jira.host,
      initiatives: this.exportInitiativesData(issuesTree, treeRoot),
      initiativesTree: this.exportSimplifiedTree(issuesTree, treeRoot)
    };

    const issueFileStream = fs.createWriteStream(
      path.join(cacheDir, 'initiatives-artifacts.json'),
      { flags: 'w' }
    );
    issueFileStream.write(JSON.stringify(initiativeArtifact));
    issueFileStream.end();
  }

  exportInitiativesData = (issuesTree: any, node: any) => {
    const jsonObject = [];
    for (const initiative of issuesTree.childrenIterator(node)) {
      jsonObject.push(initiative);
    }
    return jsonObject;
  };

  exportSimplifiedTree = (issuesTree: any, node: any) => {
    const jsonObject = [];
    for (const initiative of issuesTree.childrenIterator(node)) {
      const epics = [];
      for (const epic of issuesTree.childrenIterator(initiative)) {
        const stories = [];
        for (const story of issuesTree.childrenIterator(epic)) {
          stories.push(this.simplifyIssue(story));
        }
        epic.children = stories;
        epics.push(this.simplifyIssue(epic));
      }
      initiative.children = epics;
      jsonObject.push(this.simplifyIssue(initiative));
    }
    return jsonObject;
  };

  simplifyIssue = (issue: any) => {
    return {
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status.statusCategory.name,
      type: issue.fields.issuetype.name,
      metrics: {
        points: issue.metrics.points.total,
        issues: issue.metrics.issues.total
      },
      children: issue.children !== undefined ? issue.children : null
    };
  };
}
