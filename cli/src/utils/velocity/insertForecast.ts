
/*
    This function calculates and insert a forecast to completion
*/
const insertForecast = (calendar: any) => {
  const updatedCalendar = JSON.parse(JSON.stringify(calendar));

  const ticketsPerWeek: any = Object.values(updatedCalendar.weeks);
  const lastWeek = ticketsPerWeek[ticketsPerWeek.length - 1];
  //  console.log(lastWeek);
  updatedCalendar.forecast = {
    range: '4w',
    completion: {
      issues: {
        openCount: updatedCalendar.open.issues.count,
        velocity: lastWeek.completion.issues.velocity,
        effortDays:
          Math.round(
            (updatedCalendar.open.issues.count /
              lastWeek.completion.issues.velocity) *
              5 *
              100,
          ) / 100,
      },
      points: {
        openCount: updatedCalendar.open.points.count,
        velocity: lastWeek.completion.points.velocity,
        effortDays:
          Math.round(
            (updatedCalendar.open.points.count /
              lastWeek.completion.points.velocity) *
              5 *
              100,
          ) / 100,
      },
    },
  };
  //  console.log(updatedCalendar.forecast);
  return updatedCalendar;
};

export default insertForecast;
