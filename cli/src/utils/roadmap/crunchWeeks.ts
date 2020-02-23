// tslint:disable-next-line: file-name-casing

import { IConfig, IJiraIssue } from '../../global';
import { startOfWeek, formatISO } from 'date-fns';

const crunchWeeks = (
  issuesTree: any,
  node: any,
  closedIssues: Array<any>,
  emptyCalendar: any,
  userConfig: IConfig,
) => {
  return issuesTree.treeToArray(node).reduce((acc: any, item: any) => {
    const issueExist = closedIssues.find(i => i.key === item.key);
    if (issueExist !== undefined) {
      const firstDayWeekKey = formatISO(
        startOfWeek(new Date(issueExist.closedAt)),
        {
          representation: 'date',
        },
      );
      acc[firstDayWeekKey].list.push(issueExist);
      acc[firstDayWeekKey].issues.count = acc[firstDayWeekKey].list.length;
      if (
        issueExist.fields[userConfig.jira.fields.points] !== undefined &&
        issueExist.fields[userConfig.jira.fields.points] !== null
      ) {
        acc[firstDayWeekKey].points.count = acc[firstDayWeekKey].list
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
    }
    return acc;
  }, JSON.parse(JSON.stringify(emptyCalendar)));
};

export default crunchWeeks;
