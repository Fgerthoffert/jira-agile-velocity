/*
    This function creates an empty object containing all of the expected days and weeks between the passed dats with zeroed values
*/

interface InitObject {
  days: any;
  weeks: any;
  open: any;
  velocity: any;
  slack: any;
}

const initCalendar = (fromDate: Date, toDate: Date) => {
  let initObject: InitObject = {
    days: {},
    weeks: {},
    open: {},
    velocity: {},
    slack: {}
  };
  let emptyValues = {
    issues: { count: 0, velocity: 0 },
    points: { count: 0, velocity: 0 },
    list: []
  };
  let currentDate = fromDate;
  while (currentDate < toDate) {
    currentDate.setDate(currentDate.getDate() + 1);
    initObject.days[currentDate.toJSON().slice(0, 10)] = {
      date: currentDate.toJSON(),
      completion: emptyValues,
      scopeChangeCompletion: emptyValues
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
        completion: emptyValues,
        scopeChangeCompletion: emptyValues
      };
    }
  }
  return initObject;
};

export default initCalendar;
