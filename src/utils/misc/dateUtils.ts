// tslint:disable-next-line: file-name-casing

/*
    Returns an array of all days between two dates
*/
export const getDaysBetweenDates = (startDate: Date, endDate: Date) => {
  const days = [];
  let currentDate = startDate;
  while (currentDate < endDate) {
    days.push(currentDate.toJSON().slice(0, 10));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
};

/*
    Takes a date string and returns a date mid-day 
*/
export const formatDate = (dateString: string) => {
  let day = new Date(dateString);
  day.setUTCHours(12);
  day.setUTCMinutes(0);
  day.setUTCSeconds(0);
  return day;
};
