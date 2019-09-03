// tslint:disable-next-line: file-name-casing

import { IConfig, IJiraIssue } from "../../global";
import { startOfWeek } from "../misc/dateUtils";

const crunchWeeks = (
  issuesTree: any,
  node: any,
  closedIssues: Array<any>,
  emptyCalendar: any,
  userConfig: IConfig
) => {
  return issuesTree.treeToArray(node).reduce((acc: any, item: any) => {
    const issueExist = closedIssues.find(i => i.key === item.key);

    if (issueExist !== undefined) {
      const firstDayWeekDate = startOfWeek(new Date(issueExist.closedAt));
      const firstDayWeekKey = firstDayWeekDate.toJSON().slice(0, 10);
      acc[firstDayWeekKey].list.push(issueExist);
      acc[firstDayWeekKey].issues.count = acc[firstDayWeekKey].list.length;
      if (
        issueExist.fields[userConfig.jira.fields.points] !== undefined &&
        issueExist.fields[userConfig.jira.fields.points] !== null
      ) {
        acc[firstDayWeekKey].points.count = acc[firstDayWeekKey].list
          .filter(
            (issue: IJiraIssue) =>
              issue.fields[userConfig.jira.fields.points] !== undefined &&
              issue.fields[userConfig.jira.fields.points] !== null
          )
          .map(
            (issue: IJiraIssue) => issue.fields[userConfig.jira.fields.points]
          )
          .reduce((acc: number, points: number) => acc + points, 0);
      }
    }
    return acc;
  }, JSON.parse(JSON.stringify(emptyCalendar)));
};

export default crunchWeeks;
