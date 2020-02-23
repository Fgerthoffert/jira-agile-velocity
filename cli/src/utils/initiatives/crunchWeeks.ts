// tslint:disable-next-line: file-name-casing

import { IConfig, IJiraIssue } from '../../global';

const crunchWeeks = (
  issuesTree: any,
  node: any,
  closedIssues: Array<any>,
  emptyCalendar: any,
  userConfig: IConfig,
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
        if (
          issueExist.fields[userConfig.jira.fields.points] !== undefined &&
          issueExist.fields[userConfig.jira.fields.points] !== null
        ) {
          weeklyPoints = issuesWeeks
            .filter(
              (issue: IJiraIssue) =>
                (issue.fields[userConfig.jira.fields.points] !== undefined &&
                  issue.fields[userConfig.jira.fields.points] !== null) ||
                (issue.fields[userConfig.jira.fields.originalPoints] !==
                  undefined &&
                  issue.fields[userConfig.jira.fields.originalPoints] !== null),
            )
            .map((issue: IJiraIssue) => {
              if (
                issue.fields[userConfig.jira.fields.points] !== undefined &&
                issue.fields[userConfig.jira.fields.points] !== null
              ) {
                return issue.fields[userConfig.jira.fields.points];
              } else {
                return issue.fields[userConfig.jira.fields.originalPoints];
              }
            })
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
