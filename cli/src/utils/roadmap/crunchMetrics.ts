

// import { IConfig } from "../../global";

const crunchMetrics = (issuesTree: any, node: any) => {
  return issuesTree.treeToArray(node).reduce(
    (acc: any, item: any) => {
      if (item.points > 0) {
        acc.points.total = acc.points.total + item.points;
        if (item.fields.status.statusCategory.name === 'Done') {
          acc.points.completed = acc.points.completed + item.points;
        } else {
          acc.points.remaining = acc.points.remaining + item.points;
        }
      }
      if (item.points === 0 && issuesTree.hasChildren(node) === false) {
        acc.missingPoints = true;
      }
      if (
        item.points === 0 &&
        issuesTree.hasChildren(item) === false &&
        item.fields.status.statusCategory.name !== 'Done'
      ) {
        acc.points.missing++;
      }
      acc.issues.total = acc.issues.total + 1;
      if (item.fields.status.statusCategory.name === 'Done') {
        acc.issues.completed++;
      } else {
        acc.issues.remaining++;
      }
      return acc;
    },
    {
      missingPoints: false,
      points: { total: 0, completed: 0, remaining: 0, missing: 0 },
      issues: { total: 0, completed: 0, remaining: 0 },
    },
  );
};

export default crunchMetrics;
