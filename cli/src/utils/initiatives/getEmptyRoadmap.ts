
import { getWeek, getYear, startOfWeek, endOfWeek, formatISO } from 'date-fns';
import { formatDate } from '../misc/dateUtils';

const getEmptyRoadmap = (lastCalendarWeek: any, futureWeeks: number) => {
  // Sort the array by closedAt
  const emptyWeeks: any = [];
  let cptDays = 0;
  const currentDate = formatDate(lastCalendarWeek.weekStart);
  while (cptDays < futureWeeks * 7) {
    const weekEnd = formatISO(endOfWeek(currentDate), {
      representation: 'date',
    });
    const weekTxt =
      getYear(endOfWeek(currentDate)) + '.' + getWeek(currentDate);
    if (
      emptyWeeks.find((week: any) => week.weekTxt === weekTxt) === undefined
    ) {
      emptyWeeks.push({
        issues: { count: 0 },
        points: { count: 0 },
        weekStart: formatISO(startOfWeek(currentDate), {
          representation: 'date',
        }),
        weekEnd: weekEnd,
        weekTxt: weekTxt,
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
    cptDays++;
  }
  return emptyWeeks;
};

export default getEmptyRoadmap;
