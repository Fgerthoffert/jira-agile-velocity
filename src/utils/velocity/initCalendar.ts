// tslint:disable-next-line: file-name-casing
/*
    This function creates an empty object containing all of the expected days and weeks between the passed dats with zeroed values
*/
import { getWeek, getYear } from "date-fns";

import { ICalendar } from "../../../types/global";

const initCalendar = (fromDate: Date, toDate: Date) => {
  let initObject: ICalendar = {
    days: {},
    weeks: {},
    open: {},
    forecast: {},
    health: {}
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
      completion: { ...emptyCompletion },
      scopeChangeCompletion: { ...emptyCompletion }
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

    // tslint:disable-next-line: strict-type-predicates
    if (initObject.weeks[currentWeekYear.toJSON().slice(0, 10)] === undefined) {
      initObject.weeks[currentWeekYear.toJSON().slice(0, 10)] = {
        weekStart: currentWeekYear.toJSON(),
        date: currentWeekYear.toJSON(),
        weekNb: getWeek(currentWeekYear),
        weekTxt: getYear(currentWeekYear) + "." + getWeek(currentWeekYear),
        completion: { ...emptyCompletion },
        scopeChangeCompletion: { ...emptyCompletion }
      };
    }
  }
  return initObject;
};

export default initCalendar;
