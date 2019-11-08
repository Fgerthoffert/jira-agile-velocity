// tslint:disable-next-line: file-name-casing

import { IConfig } from '../../global';
import { exit } from '@oclif/errors';

/*
  Recursively walk the tree searching for a particular issue key
*/
const isIssueInTree: any = (issuesTree: any, node: any, issueKey: string) => {
  for (const children of issuesTree.childrenIterator(node)) {
    const parent = issuesTree.parent(node);
    if (children.key === issueKey) {
      return true;
    }
    if (issuesTree.hasChildren(children)) {
      if (isIssueInTree(issuesTree, children, issueKey)) {
        return true;
      }
    }
  }
  return false;
};

const prepareOrphanIssues = (
  issuesTree: any,
  rootNode: any,
  closedIssues: Array<any>,
) => {
  const orphanIssue: any = [];
  for (const issue of closedIssues) {
    const issueInTree = isIssueInTree(issuesTree, rootNode, issue.key);
    if (!issueInTree) {
      orphanIssue.push(issue);
    }
  }
  return orphanIssue;
};

export default prepareOrphanIssues;
