const sendSlackDailyHealth = (calendar: any, log: any, type: string) => {
  //  log(calendar.open);
  log("-----------------------------------------------------------");
  log("Howdy everyone, here are our velocity stats, live from Jira");
  log("-----------------------------------------------------------");
  log(
    "Remaining " + type + ": " + calendar.forecast.completion[type].openCount
  );
  log(
    "On " +
      calendar.health.days.completion.dayTxt +
      ", we completed: " +
      calendar.health.days.completion[type].count +
      " " +
      type +
      " [Max: " +
      calendar.health.days.completion[type].max +
      " / Min: " +
      calendar.health.days.completion[type].min +
      " / Avg: " +
      calendar.health.days.completion[type].avg +
      " for " +
      calendar.health.days.completion.dayTxt +
      "s]"
  );
  log(
    "This week (" +
      calendar.health.weeks.completion.weekTxt +
      ") we completed: " +
      calendar.health.weeks.completion[type].count +
      " " +
      type +
      " [Max: " +
      calendar.health.weeks.completion[type].max +
      " / Min: " +
      calendar.health.weeks.completion[type].min +
      " / Avg: " +
      calendar.health.weeks.completion[type].avg +
      "]"
  );
  log(
    "Our weekly velocity is at " +
      calendar.health.weeks.velocity[type].current +
      " " +
      type +
      "/week and is going: " +
      calendar.health.weeks.velocity[type].trend +
      " (from " +
      calendar.health.weeks.velocity[type].previous +
      " /week)"
  );
  log(
    "Estimated sprint completion in: " +
      calendar.forecast.completion[type].effortDays +
      " days"
  );
  log(
    "_Velocity calculated using a 4 weeks rolling window, current day is excluded from calculations_"
  );
};

export default sendSlackDailyHealth;
