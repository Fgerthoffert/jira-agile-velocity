import { IConfig } from '../../global';

const getDailyHealthMsg = (
  calendar: any,
  type: string,
  userConfig: IConfig,
  teamName: string
) => {
  const teamConfig = userConfig.teams.find(t => t.name === teamName);
  if (teamConfig !== undefined) {
    const jiraLinkRemaining =
      userConfig.jira.host + '/issues/?jql=' + teamConfig.jqlRemaining;
    const jiraLinkClosedDay =
      userConfig.jira.host +
      '/issues/?jql=' +
      teamConfig.jqlCompletion +
      ' ON(' +
      calendar.health.days.completion.msgJira +
      ')';
    const jiraLinkClosedWeek =
      userConfig.jira.host +
      '/issues/?jql=' +
      teamConfig.jqlCompletion +
      ' AFTER(' +
      calendar.health.weeks.completion.msgJira +
      ')';
    const messageString =
      'Howdy ' +
      teamConfig.name +
      ', here are our velocity stats, live from Jira.\n' +
      'Remaining: ' +
      '*<' +
      jiraLinkRemaining +
      '|' +
      calendar.forecast.completion[type].openCount +
      ' ' +
      type +
      '>*\n' +
      'On ' +
      calendar.health.days.completion.msgTxt +
      ', we completed: ' +
      '*<' +
      jiraLinkClosedDay +
      '|' +
      calendar.health.days.completion[type].count +
      ' ' +
      type +
      '>*' +
      ' [Max: ' +
      calendar.health.days.completion[type].max +
      ' / Min: ' +
      calendar.health.days.completion[type].min +
      ' / Avg: ' +
      calendar.health.days.completion[type].avg +
      ' for ' +
      calendar.health.days.completion.msgTxt +
      's]\n' +
      'This week (' +
      calendar.health.weeks.completion.msgTxt +
      ') we completed: ' +
      '*<' +
      jiraLinkClosedWeek +
      '|' +
      calendar.health.weeks.completion[type].count +
      ' ' +
      type +
      '>*' +
      ' [Max: ' +
      calendar.health.weeks.completion[type].max +
      ' / Min: ' +
      calendar.health.weeks.completion[type].min +
      ' / Avg: ' +
      calendar.health.weeks.completion[type].avg +
      ']\n' +
      'Our weekly velocity is currently at ' +
      calendar.health.weeks.velocity[type].current +
      ' ' +
      type +
      '/week and is going: *' +
      calendar.health.weeks.velocity[type].trend +
      '* (from ' +
      calendar.health.weeks.velocity[type].previous +
      ' /week)\n' +
      'Estimated completion in: *' +
      calendar.forecast.completion[type].effortDays +
      '* days\n' +
      '_Velocity calculated using a 4 weeks rolling window, current day & week are excluded from calculations._\n' +
      '_' +
      teamConfig.slack.explanation +
      '_';
    return messageString;
  }
  return '';
};

export default getDailyHealthMsg;
