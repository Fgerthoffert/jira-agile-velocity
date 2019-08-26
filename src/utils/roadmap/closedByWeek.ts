// tslint:disable-next-line: file-name-casing
/*
    This function creates an empty object containing all of the expected days and weeks between the passed dats with zeroed values
*/
import { getWeek, getYear } from "date-fns";

import { ICalendar, IJiraIssue } from "../../global";
import { formatDate, startOfWeek } from "../misc/dateUtils";

const closedByWeek = (issues: Array<any>) => {
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
        weekStart: currentWeekYear.toJSON()
      };
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  for (let issue of issues) {
    const firstWeekDat = startOfWeek(new Date(issue.closedAt));
    weeks[firstWeekDat.toJSON().slice(0, 10)].list.push(issue);
  }
  return Object.values(weeks);
};

export default closedByWeek;
