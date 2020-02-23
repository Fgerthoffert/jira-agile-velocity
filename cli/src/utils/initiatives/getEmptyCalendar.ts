/*
    This function creates an empty object containing all of the expected days and weeks between the passed dats with zeroed values
*/
import { getWeek, getYear, startOfWeek, endOfWeek, formatISO } from 'date-fns';

import { IJiraIssue } from '../../global';
import { formatDate } from '../misc/dateUtils';

const getEmptyCalendar = (issues: Array<IJiraIssue>) => {
  // Sort the array by closedAt
  issues.sort((a, b) =>
    a.closedAt > b.closedAt ? 1 : b.closedAt > a.closedAt ? -1 : 0,
  );
  const emptyWeeks: any = [];
  const currentDate = formatDate(issues[0].closedAt);
  while (currentDate < formatDate(issues[issues.length - 1].closedAt)) {
    const weekEnd = formatISO(endOfWeek(currentDate), {
      representation: 'date',
    });
    const weekTxt =
      getYear(endOfWeek(currentDate)) + '.' + getWeek(currentDate);
    if (
      emptyWeeks.find((week: any) => week.weekTxt === weekTxt) === undefined
    ) {
      emptyWeeks.push({
        list: [],
        issues: { count: 0 },
        points: { count: 0 },
        weekStart: formatISO(startOfWeek(currentDate), {
          representation: 'date',
        }),
        weekEnd: weekEnd,
        weekTxt,
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return emptyWeeks;
};

export default getEmptyCalendar;
