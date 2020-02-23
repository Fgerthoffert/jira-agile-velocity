// tslint:disable-next-line: file-name-casing
/*
    
*/
import { getWeek, getYear, startOfWeek, endOfWeek, formatISO } from 'date-fns';
import { formatDate } from '../misc/dateUtils';

const getEmptyRoadmapObject = (lastCalendarWeek: any, futureWeeks: number) => {
  // Sort the array by closedAt
  const emptyWeeks: any = {};
  let cptDays = 0;
  const currentDate = formatDate(lastCalendarWeek.weekStart);
  while (cptDays < futureWeeks * 7) {
    const weekStart = formatISO(startOfWeek(currentDate), {
      representation: 'date',
    });
    const weekEnd = formatISO(endOfWeek(currentDate), {
      representation: 'date',
    });
    if (emptyWeeks[weekStart] === undefined) {
      emptyWeeks[weekStart] = {
        issues: { count: 0 },
        points: { count: 0 },
        weekStart: weekStart,
        weekEnd: weekEnd,
        weekTxt: getYear(endOfWeek(currentDate)) + '.' + getWeek(weekStart),
      };
    }
    currentDate.setDate(currentDate.getDate() + 1);
    cptDays++;
  }
  return emptyWeeks;
};

export default getEmptyRoadmapObject;
