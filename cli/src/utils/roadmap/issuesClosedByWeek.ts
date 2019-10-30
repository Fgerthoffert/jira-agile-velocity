// tslint:disable-next-line: file-name-casing
/*
    This function creates an empty object containing all of the expected days and weeks between the passed dats with zeroed values
*/

import { IConfig, IJiraIssue } from '../../global';
import { startOfWeek } from '../misc/dateUtils';

const issuesClosedByWeek = (
  issues: Array<IJiraIssue>,
  userConfig: IConfig,
  emptyCalendar: any,
) => {
  let weeks = JSON.parse(JSON.stringify(emptyCalendar));

  for (let issue of issues) {
    const firstDayWeekDate = startOfWeek(new Date(issue.closedAt));
    const firstDayWeekKey = firstDayWeekDate.toJSON().slice(0, 10);
    weeks[firstDayWeekKey].list.push(issue);
    weeks[firstDayWeekKey].issues.count =
      weeks[firstDayWeekKey].list.length;

    if (
      issue.fields[userConfig.jira.fields.points] !== undefined &&
      issue.fields[userConfig.jira.fields.points] !== null
    ) {
      weeks[firstDayWeekKey].points.count = weeks[
        firstDayWeekKey
      ].list.filter(
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

  return weeks;
};

export default issuesClosedByWeek;
