import { ICalendar } from "../../global";

const getDailyHealthMsg = (
  calendar: ICalendarFinal,
  type: string,
  jira_jqlremaining: string,
  jira_jqlcompletion: string,
  jira_host: string
) => {
  const jiraLinkRemaining = jira_host + "/issues/?jql=" + jira_jqlremaining;
  const jiraLinkClosedDay =
    jira_host +
    "/issues/?jql=" +
    jira_jqlcompletion +
    " ON(" +
    calendar.health.days.completion.dayJira +
    ")";
  const jiraLinkClosedWeek =
    jira_host +
    "/issues/?jql=" +
    jira_jqlcompletion +
    " AFTER(" +
    calendar.health.weeks.completion.weekJira +
    ")";
  let messageString =
    "Howdy everyone, here are our velocity stats, live from Jira\n" +
    "-----------------------------------------------------------\n" +
    "Remaining: " +
    "*<" +
    jiraLinkRemaining +
    "|" +
    calendar.forecast.completion[type].openCount +
    " " +
    type +
    ">*\n" +
    "On " +
    calendar.health.days.completion.dayTxt +
    ", we completed: " +
    "*<" +
    jiraLinkClosedDay +
    "|" +
    calendar.health.days.completion[type].count +
    " " +
    type +
    ">*" +
    " [Max: " +
    calendar.health.days.completion[type].max +
    " / Min: " +
    calendar.health.days.completion[type].min +
    " / Avg: " +
    calendar.health.days.completion[type].avg +
    " for " +
    calendar.health.days.completion.dayTxt +
    "s]\n" +
    "This week (" +
    calendar.health.weeks.completion.weekTxt +
    ") we completed: " +
    "*<" +
    jiraLinkClosedWeek +
    "|" +
    calendar.health.weeks.completion[type].count +
    " " +
    type +
    ">*" +
    " [Max: " +
    calendar.health.weeks.completion[type].max +
    " / Min: " +
    calendar.health.weeks.completion[type].min +
    " / Avg: " +
    calendar.health.weeks.completion[type].avg +
    "]\n" +
    "Our weekly velocity is currently at " +
    calendar.health.weeks.velocity[type].current +
    " " +
    type +
    "/week and is going: *" +
    calendar.health.weeks.velocity[type].trend +
    "* (from " +
    calendar.health.weeks.velocity[type].previous +
    " /week)\n" +
    "Estimated sprint completion in: *" +
    calendar.forecast.completion[type].effortDays +
    "* days\n" +
    "_Velocity calculated using a 4 weeks rolling window, current day & week are excluded from calculations_";
  return messageString;
};

export default getDailyHealthMsg;
