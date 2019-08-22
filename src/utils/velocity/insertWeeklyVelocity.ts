// tslint:disable-next-line: file-name-casing
import { ICalendar, IWeeks } from "../../global";

import calculateAverageVelocity from "./calculateAverageVelocity";

/*
    This function calculates and insert daily velocity metrics
*/
const insertWeeklyVelocity = (calendar: ICalendar) => {
  const updatedCalendar: ICalendar = JSON.parse(JSON.stringify(calendar));
  let ticketsPerWeek: Array<IWeeks> = Object.values(updatedCalendar.weeks);

  let startIdx = 0;
  for (let idx = 0; idx < ticketsPerWeek.length; idx++) {
    // Rolling averages are calculates over a window of 4 weeks
    if (idx <= 4) {
      startIdx = 0;
    } else {
      startIdx = idx - 4;
    }
    if (idx !== 0) {
      /*
      console.log(
        "Weekly Velocity - Processing window: " +
          startIdx +
          " -> " +
          idx +
          ", from: " +
          ticketsPerWeek[startIdx].date +
          " to: " +
          ticketsPerWeek[idx].date
      );
      */
      let currentWindowIssues = ticketsPerWeek.slice(startIdx, idx);
      ticketsPerWeek[idx].completion.issues.velocity = calculateAverageVelocity(
        currentWindowIssues,
        "completion",
        "issues"
      );
      ticketsPerWeek[idx].completion.points.velocity = calculateAverageVelocity(
        currentWindowIssues,
        "completion",
        "points"
      );
      ticketsPerWeek[
        idx
      ].scopeChangeCompletion.issues.velocity = calculateAverageVelocity(
        currentWindowIssues,
        "scopeChangeCompletion",
        "issues"
      );
      ticketsPerWeek[
        idx
      ].scopeChangeCompletion.points.velocity = calculateAverageVelocity(
        currentWindowIssues,
        "scopeChangeCompletion",
        "points"
      );
    }
  }
  return ticketsPerWeek;
};

export default insertWeeklyVelocity;
