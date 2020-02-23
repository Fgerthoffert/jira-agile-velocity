// tslint:disable-next-line: file-name-casing
/*
    This function creates an empty object containing all of the expected days and weeks between the passed dats with zeroed values
*/

import { IConfig, IJiraIssue } from '../../global';
import { startOfWeek, formatISO } from 'date-fns';

const issuesClosedByWeek = (
  issues: Array<IJiraIssue>,
  userConfig: IConfig,
  emptyCalendar: any,
) => {
  const weeks = JSON.parse(JSON.stringify(emptyCalendar));

  for (const issue of issues) {
    const firstDayWeekKey = formatISO(startOfWeek(new Date(issue.closedAt)), {
      representation: 'date',
    });
    weeks[firstDayWeekKey].list.push(issue);
    weeks[firstDayWeekKey].issues.count = weeks[firstDayWeekKey].list.length;

    if (
      issue.fields[userConfig.jira.fields.points] !== undefined &&
      issue.fields[userConfig.jira.fields.points] !== null
    ) {
      weeks[firstDayWeekKey].points.count = weeks[firstDayWeekKey].list
        .filter(
          (issue: IJiraIssue) =>
            issue.fields[userConfig.jira.fields.points] !== undefined &&
            issue.fields[userConfig.jira.fields.points] !== null,
        )
        .map((issue: IJiraIssue) => issue.fields[userConfig.jira.fields.points])
        .reduce((acc: number, points: number) => acc + points, 0);
    }
  }

  return weeks;
};

export default issuesClosedByWeek;
