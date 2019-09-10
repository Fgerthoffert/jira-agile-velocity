// tslint:disable-next-line: file-name-casing
/*
    This function creates an empty object containing all of the expected days and weeks between the passed dats with zeroed values
*/
import { getWeek, getYear } from 'date-fns';

import { ICalendar, IConfig, IJiraIssue } from '../../global';
import { formatDate, startOfWeek } from '../misc/dateUtils';
import { getTeamId } from '../misc/teamUtils';

const teamClosedByWeek = (
  issues: Array<IJiraIssue>,
  userConfig: IConfig,
  emptyCalendar: any,
  teamVelocity: Array<any>
) => {
  const teams = [];
  // allTeams record aggregated values for all teams
  const allTeams = {
    name: null,
    weeks: JSON.parse(JSON.stringify(emptyCalendar))
  };
  for (let team of userConfig.roadmap.teams) {
    // WeeksTeam record aggregated values for one single team
    const weeksTeam = {
      name: team,
      weeks: JSON.parse(JSON.stringify(emptyCalendar)),
      velocity: teamVelocity.find(v => v.team === team).velocity
    };
    for (let issue of issues.filter(i => i.team === team)) {
      const firstDayWeekDate = startOfWeek(new Date(issue.closedAt));
      const firstDayWeekKey = firstDayWeekDate.toJSON().slice(0, 10);
      weeksTeam.weeks[firstDayWeekKey].list.push(issue);
      weeksTeam.weeks[firstDayWeekKey].issues.count =
        weeksTeam.weeks[firstDayWeekKey].list.length;

      // TODO-Need to remove any issues that might be a duplicate due to the filtering applied
      if (
        !allTeams.weeks[firstDayWeekKey].list.some(
          (i: IJiraIssue) => i.key === issue.key
        )
      ) {
        allTeams.weeks[firstDayWeekKey].list.push(issue);
      }
      allTeams.weeks[firstDayWeekKey].issues.count =
        allTeams.weeks[firstDayWeekKey].list.length;
      if (
        issue.fields[userConfig.jira.fields.points] !== undefined &&
        issue.fields[userConfig.jira.fields.points] !== null
      ) {
        weeksTeam.weeks[firstDayWeekKey].points.count = weeksTeam.weeks[
          firstDayWeekKey
        ].list
          .filter(
            (issue: IJiraIssue) =>
              issue.fields[userConfig.jira.fields.points] !== undefined &&
              issue.fields[userConfig.jira.fields.points] !== null
          )
          .map(
            (issue: IJiraIssue) => issue.fields[userConfig.jira.fields.points]
          )
          .reduce((acc: number, points: number) => acc + points, 0);
        allTeams.weeks[firstDayWeekKey].points.count = allTeams.weeks[
          firstDayWeekKey
        ].list
          .filter(
            (issue: IJiraIssue) =>
              issue.fields[userConfig.jira.fields.points] !== undefined &&
              issue.fields[userConfig.jira.fields.points] !== null
          )
          .map(
            (issue: IJiraIssue) => issue.fields[userConfig.jira.fields.points]
          )
          .reduce((acc: number, points: number) => acc + points, 0);
      }
    }
    weeksTeam.weeks = Object.values(weeksTeam.weeks);
    teams.push(weeksTeam);
  }
  allTeams.weeks = Object.values(allTeams.weeks);
  teams.push(allTeams);
  return teams;
};

export default teamClosedByWeek;
