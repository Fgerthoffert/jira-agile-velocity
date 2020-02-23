import { IConfig } from '../../global';

import crunchMetrics from './crunchMetrics';
import crunchWeeks from './crunchWeeks';

/* eslint max-params: ["error", 6] */
/* eslint-env es6 */
const prepareInitiativesData = (
  issuesTree: any,
  node: any,
  level: number,
  closedIssues: Array<any>,
  emptyCalendar: any,
  userConfig: IConfig,
) => {
  if (node.key !== undefined) {
    node.level = level;
    node.metrics = crunchMetrics(issuesTree, node);
    node.isLeaf = !issuesTree.hasChildren(node);
    node.weeks = crunchWeeks(
      issuesTree,
      node,
      closedIssues,
      emptyCalendar,
      userConfig,
    );
  }
  for (const children of issuesTree.childrenIterator(node)) {
    prepareInitiativesData(
      issuesTree,
      children,
      level + 1,
      closedIssues,
      emptyCalendar,
      userConfig,
    );
  }
  return [];
};

export default prepareInitiativesData;
