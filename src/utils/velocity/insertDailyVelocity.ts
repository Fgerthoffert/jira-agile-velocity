// tslint:disable-next-line: file-name-casing
import { ICalendar, IDays } from "../../../types/global";

import calculateAverageVelocity from "./calculateAverageVelocity";

/*
    This function calculates and insert daily velocity metrics
*/
const insertDailyVelocity = (calendar: ICalendar) => {
  const updatedCalendar: ICalendar = JSON.parse(JSON.stringify(calendar));
  let ticketsPerDay: Array<IDays> = Object.values(updatedCalendar.days);

  let startIdx = 0;
  for (let idx = 0; idx < ticketsPerDay.length; idx++) {
    //ticketsPerDay.map((value: any, idx: number) => {
    // Rolling averages are calculates over a window of 20 days
    if (idx <= 20) {
      startIdx = 0;
    } else {
      startIdx = idx - 20;
    }
    if (idx !== 0) {
      /*
      console.log(
        "Daily Velocity - Processing window: " +
          startIdx +
          " -> " +
          idx +
          ", from: " +
          ticketsPerDay[startIdx].date +
          " to: " +
          ticketsPerDay[idx].date
      );
      */
      let currentWindowIssues = ticketsPerDay.slice(startIdx, idx);
      ticketsPerDay[idx].completion.issues.velocity = calculateAverageVelocity(
        currentWindowIssues,
        "completion",
        "issues"
      );
      ticketsPerDay[idx].completion.points.velocity = calculateAverageVelocity(
        currentWindowIssues,
        "completion",
        "points"
      );
      ticketsPerDay[
        idx
      ].scopeChangeCompletion.issues.velocity = calculateAverageVelocity(
        currentWindowIssues,
        "scopeChangeCompletion",
        "issues"
      );
      ticketsPerDay[
        idx
      ].scopeChangeCompletion.points.velocity = calculateAverageVelocity(
        currentWindowIssues,
        "scopeChangeCompletion",
        "points"
      );
    }
  }
  updatedCalendar.days = ticketsPerDay;
  return updatedCalendar;
};

export default insertDailyVelocity;
