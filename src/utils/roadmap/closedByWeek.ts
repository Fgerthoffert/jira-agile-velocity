// tslint:disable-next-line: file-name-casing
/*
    This function creates an empty object containing all of the expected days and weeks between the passed dats with zeroed values
*/
import { getWeek, getYear } from "date-fns";

import { ICalendar, IConfig, IJiraIssue } from "../../global";
import { formatDate, startOfWeek } from "../misc/dateUtils";

const closedByWeek = (issues: Array<any>, userConfig: IConfig) => {
  // Sort the array
  issues.sort((a, b) =>
    a.closedAt > b.closedAt ? 1 : b.closedAt > a.closedAt ? -1 : 0
  );
  const weeks: any = {};

  let currentDate = formatDate(issues[0].closedAt);
  while (currentDate < formatDate(issues[issues.length - 1].closedAt)) {
    let currentMonthDay = currentDate.getDate();
    if (currentDate.getDay() !== 0) {
      currentMonthDay = currentMonthDay - currentDate.getDay();
    }
    let currentWeekYear: any = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentMonthDay
    );
    if (weeks[currentWeekYear.toJSON().slice(0, 10)] === undefined) {
      weeks[currentWeekYear.toJSON().slice(0, 10)] = {
        list: [],
        issues: { count: 0 },
        points: { count: 0 },
        weekStart: currentWeekYear.toJSON()
      };
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  for (let issue of issues) {
    const firstWeekDat = startOfWeek(new Date(issue.closedAt));
    weeks[firstWeekDat.toJSON().slice(0, 10)].list.push(issue);
    weeks[firstWeekDat.toJSON().slice(0, 10)].issues.count =
      weeks[firstWeekDat.toJSON().slice(0, 10)].list.length;
    if (
      issue.fields[userConfig.jira.pointsField] !== undefined &&
      issue.fields[userConfig.jira.pointsField] !== null
    ) {
      weeks[firstWeekDat.toJSON().slice(0, 10)].points.count = weeks[
        firstWeekDat.toJSON().slice(0, 10)
      ].list
        .filter(
          (issue: IJiraIssue) =>
            issue.fields[userConfig.jira.pointsField] !== undefined &&
            issue.fields[userConfig.jira.pointsField] !== null
        )
        .map((issue: IJiraIssue) => issue.fields[userConfig.jira.pointsField])
        .reduce((acc: number, points: number) => acc + points, 0);
    }
  }
  return Object.values(weeks);
};

export default closedByWeek;
