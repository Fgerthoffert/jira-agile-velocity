// tslint:disable-next-line: file-name-casing

import { IConfig } from '../../global';

import crunchMetrics from './crunchMetrics';
import crunchWeeks from './crunchWeeks';

const prepareInitiativesData = (
  issuesTree: any,
  node: any,
  level: number,
  closedIssues: Array<any>,
  emptyCalendar: any,
  userConfig: IConfig
) => {
  if (node.key !== undefined) {
    node.level = level;
    node.metrics = crunchMetrics(issuesTree, node);
    node.isLeaf = issuesTree.hasChildren(node) ? false : true;
    node.weeks = Object.values(
      crunchWeeks(issuesTree, node, closedIssues, emptyCalendar, userConfig)
    );
  }
  for (const children of issuesTree.childrenIterator(node)) {
    prepareInitiativesData(
      issuesTree,
      children,
      level + 1,
      closedIssues,
      emptyCalendar,
      userConfig
    );
  }
  return [];
};

export default prepareInitiativesData;
