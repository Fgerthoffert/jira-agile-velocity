// tslint:disable-next-line: file-name-casing

/*
    Returns an array of all days between two dates
*/
export const getDaysBetweenDates = (startDate: Date, endDate: Date) => {
  const days = [];
  const currentDate = startDate;
  while (currentDate < endDate) {
    days.push(currentDate.toJSON().slice(0, 10));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
};

/*
    Returns an array of all weeks between two dates
*/
export const getWeeksBetweenDates = (startDate: Date, endDate: Date) => {
  const weeks: Array<string> = [];
  const currentDate = startDate;
  while (currentDate < endDate) {
    let currentMonthDay = currentDate.getDate();
    if (currentDate.getDay() !== 0) {
      currentMonthDay = currentMonthDay - currentDate.getDay();
    }
    const currentWeekYear = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentMonthDay
    );
    if (
      weeks.find(w => w === currentWeekYear.toJSON().slice(0, 10)) === undefined
    ) {
      weeks.push(currentWeekYear.toJSON().slice(0, 10));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return weeks;
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

/* Takes a date and returns the first day of the week */
export const startOfWeek = (date: Date) => {
  let currentMonthDay = date.getDate();
  if (date.getDay() !== 0) {
    currentMonthDay = currentMonthDay - date.getDay();
  }
  const currentWeekYear: any = new Date(
    date.getFullYear(),
    date.getMonth(),
    currentMonthDay
  );
  return currentWeekYear;
};
