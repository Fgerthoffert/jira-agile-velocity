import { IConfig } from '../../global';

import crunchMetrics from './crunchMetrics';

/* eslint max-params: ["error", 6] */
/* eslint-env es6 */
const prepareIssuesData = (
  issuesTree: any,
  node: any,
  level: number,
  userConfig: IConfig,
) => {
  if (node.key !== undefined) {
    node.level = level;
    node.metrics = crunchMetrics(issuesTree, node);
    node.isLeaf = !issuesTree.hasChildren(node);
  }
  for (const children of issuesTree.childrenIterator(node)) {
    prepareIssuesData(issuesTree, children, level + 1, userConfig);
  }
  return [];
};

export default prepareIssuesData;
