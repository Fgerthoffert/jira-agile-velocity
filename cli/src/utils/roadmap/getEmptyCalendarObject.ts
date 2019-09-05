// tslint:disable-next-line: file-name-casing
/*
    This function creates an empty object containing all of the expected days and weeks between the passed dats with zeroed values
*/
import { getWeek, getYear } from 'date-fns';

import { ICalendar, IConfig, IJiraIssue } from '../../global';
import { formatDate, startOfWeek } from '../misc/dateUtils';
import { getTeamId } from '../misc/teamUtils';

const getEmptyCalendarObject = (
  issues: Array<IJiraIssue>,
  userConfig: IConfig
) => {
  // Sort the array by closedAt
  issues.sort((a, b) =>
    a.closedAt > b.closedAt ? 1 : b.closedAt > a.closedAt ? -1 : 0
  );
  const emptyWeeks: any = {};
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
    if (emptyWeeks[currentWeekYear.toJSON().slice(0, 10)] === undefined) {
      emptyWeeks[currentWeekYear.toJSON().slice(0, 10)] = {
        list: [],
        issues: { count: 0 },
        points: { count: 0 },
        weekStart: currentWeekYear.toJSON(),
        weekTxt: getYear(currentWeekYear) + '.' + getWeek(currentWeekYear)
      };
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return emptyWeeks;
};

export default getEmptyCalendarObject;
