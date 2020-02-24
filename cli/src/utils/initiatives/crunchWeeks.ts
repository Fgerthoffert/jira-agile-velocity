import { IJiraIssue } from '../../global';

/* eslint max-params: ["error", 6] */
/* eslint-env es6 */
const crunchWeeks = (
  issuesTree: any,
  node: any,
  closedIssues: Array<any>,
  emptyCalendar: any,
) => {
  return issuesTree.treeToArray(node).reduce((acc: any, item: any) => {
    const issueExist = closedIssues.find(i => i.key === item.key);
    return acc.map((week: any) => {
      if (issueExist !== undefined && week.weekStart === issueExist.weekStart) {
        // if (issueExist.key === 'BACKLOG-11527') {
        //   console.log(week.weekTxt);
        //   console.log(issueExist);
        // }
        const issuesWeeks = [...week.list, issueExist];
        let weeklyPoints = week.points.count;
        // If current issue contains points, re-calculate weekly totals
        if (issueExist.points !== undefined && issueExist.points !== null) {
          weeklyPoints = issuesWeeks
            .filter(
              (issue: IJiraIssue) =>
                issue.points !== undefined && issue.points !== null,
            )
            .map((issue: IJiraIssue) => issue.points)
            .reduce((acc: number, points: number) => acc + points, 0);
        }
        return {
          ...week,
          list: issuesWeeks,
          issues: { count: issuesWeeks.length },
          points: { count: weeklyPoints },
        };
      }
      return week;
    });
  }, emptyCalendar);
};

export default crunchWeeks;
