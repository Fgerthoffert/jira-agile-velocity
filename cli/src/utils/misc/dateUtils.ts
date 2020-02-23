import { getWeek, getYear, startOfWeek, endOfWeek, formatISO } from 'date-fns';

/*
    Returns an array of all days between two dates
*/
export const getDaysBetweenDates = (startDate: Date, endDate: Date) => {
  const days: Array<any> = [];
  const currentDate = startDate;
  // eslint-disable-next-line no-unmodified-loop-condition
  while (currentDate < endDate) {
    let currentMonthDay = currentDate.getDate();
    if (currentDate.getDay() !== 0) {
      currentMonthDay -= currentDate.getDay();
    }
    const currentWeekYear: any = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentMonthDay,
    );
    currentWeekYear.setUTCHours(0);
    const actualDate = new Date(currentDate);
    actualDate.setUTCHours(0);
    days.push({
      date: actualDate,
      weekStart: formatISO(startOfWeek(actualDate), {
        representation: 'date',
      }),
      weekEnd: formatISO(endOfWeek(actualDate), {
        representation: 'date',
      }),
      weekTxt: getYear(actualDate) + '.' + getWeek(actualDate),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
};

/*
    Takes a date string and returns a date mid-day 
*/
export const formatDate = (dateString: string) => {
  const day = new Date(dateString);
  day.setUTCHours(12);
  day.setUTCMinutes(0);
  day.setUTCSeconds(0);
  return day;
};
