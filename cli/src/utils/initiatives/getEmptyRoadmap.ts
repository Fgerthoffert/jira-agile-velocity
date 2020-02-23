import { getWeek, getYear, startOfWeek, endOfWeek, formatISO } from 'date-fns';

const getEmptyRoadmap = (lastCalendarWeek: any, futureWeeks: number) => {
  // Sort the array by closedAt
  const emptyWeeks: any = [];
  let cptDays = 0;
  // We need to verify if the previous week is actually complete,
  // if yes, we need to set the first date as the first day of of the current week.
  const currentStartWeek = formatISO(startOfWeek(new Date()), {
    representation: 'date',
  });
  const currentDate =
    currentStartWeek === lastCalendarWeek.weekStart
      ? new Date(lastCalendarWeek.weekStart)
      : startOfWeek(new Date());
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
