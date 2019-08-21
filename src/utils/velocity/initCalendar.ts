/*
    This function creates an empty object containing all of the expected days and weeks between the passed dats with zeroed values
*/
import { getWeek, getYear } from "date-fns";

interface InitObject {
  days: any;
  weeks: any;
}

const initCalendar = (fromDate: Date, toDate: Date) => {
  let initObject: InitObject = {
    days: {},
    weeks: {},
  };
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];  
  const emptyCompletion = {
    issues: { count: 0, velocity: 0 },
    points: { count: 0, velocity: 0 },
    list: []
  };
  let currentDate = fromDate;
  while (currentDate < toDate) {
    currentDate.setDate(currentDate.getDate() + 1);
    initObject.days[currentDate.toJSON().slice(0, 10)] = {
      date: currentDate.toJSON(),
      weekDay: currentDate.getDay(),
      weekDayTxt: days[currentDate.getDay()],
      completion: {...emptyCompletion},
      scopeChangeCompletion: {...emptyCompletion}
    };
    let currentMonthDay = currentDate.getDate();
    if (currentDate.getDay() !== 0) {
      currentMonthDay = currentMonthDay - currentDate.getDay();
    }
    let currentWeekYear = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentMonthDay
    );

    if (initObject.weeks[currentWeekYear.toJSON().slice(0, 10)] === undefined) {
      initObject.weeks[currentWeekYear.toJSON().slice(0, 10)] = {
        weekStart: currentWeekYear.toJSON(),
        date: currentWeekYear.toJSON(),
        weekNb: getWeek(currentWeekYear),
        weekTxt: getYear(currentWeekYear) + "." + getWeek(currentWeekYear),
        completion: {...emptyCompletion},
        scopeChangeCompletion: {...emptyCompletion}
      };
    }
  }
  return initObject;
};

export default initCalendar;
