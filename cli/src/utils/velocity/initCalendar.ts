/*
    This function creates an empty object containing all of the expected days and weeks between the passed dats with zeroed values
*/
import { getWeek, getYear, startOfWeek, endOfWeek, formatISO } from 'date-fns';

import { ICalendar } from '../../global';
import { formatDate } from '../misc/dateUtils';

const initCalendar = (fromDate: string, toDate?: string | undefined) => {
  const initObject: ICalendar = {
    days: {},
    weeks: {},
    open: {},
    forecast: {},
    health: {},
  };
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const emptyCompletion = {
    issues: { count: 0, velocity: 0 },
    points: { count: 0, velocity: 0 },
    list: [],
  };
  let toDay = new Date();
  toDay.setDate(toDay.getDate() - 1); // We don't process current day, only fetching closed issues on past days
  if (toDate !== undefined) {
    toDay = new Date(toDate);
  }
  const currentDate = formatDate(fromDate);
  // eslint-disable-next-line no-unmodified-loop-condition
  while (currentDate < toDay) {
    currentDate.setDate(currentDate.getDate() + 1);
    const weekTxt =
      getYear(endOfWeek(currentDate)) + '.' + getWeek(currentDate);
    const weekStart = formatISO(startOfWeek(currentDate), {
      representation: 'date',
    });
    const currentDayKey = formatISO(currentDate, {
      representation: 'date',
    });
    initObject.days[currentDayKey] = {
      date: formatISO(currentDate, { representation: 'date' }),
      weekDay: currentDate.getDay(),
      weekDayJira: formatISO(currentDate, { representation: 'date' }),
      weekDayTxt: days[currentDate.getDay()],
      weekNb: getWeek(currentDate),
      weekTxt: weekTxt,
      completion: { ...emptyCompletion },
      scopeChangeCompletion: { ...emptyCompletion },
    };

    // tslint:disable-next-line: strict-type-predicates
    if (initObject.weeks[weekStart] === undefined) {
      initObject.weeks[weekStart] = {
        weekStart,
        weekEnd: formatISO(endOfWeek(currentDate), { representation: 'date' }),
        date: weekStart,
        weekNb: getWeek(currentDate),
        weekTxt: weekTxt,
        weekJira: weekStart,
        completion: { ...emptyCompletion },
        scopeChangeCompletion: { ...emptyCompletion },
      };
    }
  }
  return initObject;
};

export default initCalendar;
