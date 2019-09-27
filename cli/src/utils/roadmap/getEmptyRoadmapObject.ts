// tslint:disable-next-line: file-name-casing
/*
    
*/
import { getWeek, getYear } from 'date-fns';
import { formatDate } from '../misc/dateUtils';

const getEmptyRoadmapObject = (lastCalendarWeek: any, futureWeeks: number) => {
  // Sort the array by closedAt
  const emptyWeeks: any = {};
  let cptDays = 0;
  let currentDate = formatDate(lastCalendarWeek.weekStart);
  while (cptDays < futureWeeks * 7) {
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
        issues: { count: 0 },
        points: { count: 0 },
        weekStart: currentWeekYear.toJSON(),
        weekTxt: getYear(currentWeekYear) + '.' + getWeek(currentWeekYear)
      };
    }
    currentDate.setDate(currentDate.getDate() + 1);
    cptDays++;
  }
  return emptyWeeks;
};

export default getEmptyRoadmapObject;
