import { ICalendar, IWeeks, IControlBucket } from '../../global';

const insertControlData = (calendar: ICalendar, controlBuckets: Array<IControlBucket>) => {
  const updatedCalendar: ICalendar = JSON.parse(JSON.stringify(calendar));
  const ticketsPerWeek: Array<IWeeks> = Object.values(updatedCalendar.weeks);

  const controlWeeks = [];

  let startIdx = 0;
  for (let idx = 0; idx < ticketsPerWeek.length; idx++) {
    // Rolling averages are calculates over a window of 4 weeks
    if (idx <= 4) {
      startIdx = 0;
    } else {
      startIdx = idx - 4;
    }
    if (idx !== 0) {

      // console.log(
      //   "Weekly Velocity - Processing window: " +
      //     startIdx +
      //     " -> " +
      //     idx +
      //     ", from: " +
      //     ticketsPerWeek[startIdx].date +
      //     " to: " +
      //     ticketsPerWeek[idx].date
      // );

      const currentWindowIssues = ticketsPerWeek.slice(startIdx, idx);

      const allValues = [];
      for (const w of currentWindowIssues) {
        for (const i of w.completion.list) {
          allValues.push(i.openedForBusinessDays)
        }
      }

      const buckets = controlBuckets.map((cb) => {
        return {
          ...cb,
          list: ticketsPerWeek[idx].completion.list.filter((i) => cb.isInBucket(i.openedForBusinessDays)).map((i) => {return {
            key: i.key,
            openedForBusinessDays: i.openedForBusinessDays,
          }})
        }
      })

      controlWeeks.push({
        date: ticketsPerWeek[idx].date,
        weekStart: ticketsPerWeek[idx].weekStart,
        weekEnd: ticketsPerWeek[idx].weekEnd,
        weekNb: ticketsPerWeek[idx].weekNb,
        weekTxt: ticketsPerWeek[idx].weekTxt,
        weekJira: ticketsPerWeek[idx].weekJira,
        completion: ticketsPerWeek[idx].completion,
        buckets: buckets,
        openedForAvg: {
          value: Math.round(ticketsPerWeek[idx].completion.list.map((i) => i.openedForBusinessDays).reduce((a, b) => a + b, 0) / ticketsPerWeek[idx].completion.list.length),
          dataset: ticketsPerWeek[idx].completion.list.map((i) => i.openedForBusinessDays)
        },
        openedForRolling: {
          value: Math.round((allValues.reduce((a, b) => a + b, 0) / allValues.length) || 0),
          dataset: allValues
        },
      })
    }
  }
  return controlWeeks;
};

export default insertControlData;
