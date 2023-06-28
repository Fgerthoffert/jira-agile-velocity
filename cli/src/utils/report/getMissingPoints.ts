// Returns the list of issues that are missing estimates
export const getMissingPoints = (issue: any) => {
  let missingPoints: any = [];
  if (issue.children !== undefined && issue.children.length > 0) {
    for (const childIssue of issue.children) {
      const childMissingPoints = getMissingPoints(childIssue);
      missingPoints = [...missingPoints, ...childMissingPoints];
    }
  } else if (issue.children === undefined || issue.children.length === 0) {
    if (issue.metrics.points.missing > 0) {
      missingPoints.push(issue.key);
    }
  }
  return missingPoints;
};
