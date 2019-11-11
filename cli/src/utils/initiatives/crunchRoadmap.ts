// tslint:disable-next-line: file-name-casing
import { getTeamId } from '../misc/teamUtils';
import { exit } from '@oclif/errors';

const fillWeek = (
  weeks: Array<any>,
  velocityIssues: number,
  remainingIssues: number,
  velocityPoints: number,
  remainingPoints: number,
  initiativesRoadmap: Array<any>, // We need to look back at history to avoid parrallel initiatives for the same team
  teamInitiatives: Array<any>, // We need to look back at history to avoid parrallel initiatives for the same team
) => {
  if (remainingPoints === 0 && remainingIssues === 0) {
    return weeks;
  }
  let currentRemainingPoints = remainingPoints;
  let currentRemainingIssues = remainingIssues;

  return weeks.map((week: any) => {
    // Get total number of points completed that week across all issues
    const overallWeekCompletion = [
      ...initiativesRoadmap,
      ...teamInitiatives,
    ].reduce(
      (acc: any, initiative: any) => {
        for (const iWeek of initiative.weeks.filter(
          (w: any) => w.weekStart === week.weekStart,
        )) {
          acc.weekStart = iWeek.weekStart;
          acc.weekTxt = iWeek.weekTxt;
          acc.points.count = acc.points.count + iWeek.points.count;
          acc.issues.count = acc.issues.count + iWeek.issues.count;
          acc.list = [...acc.list, ...iWeek.list];
        }
        return acc;
      },
      {
        weekStart: '',
        weekTxt: '',
        points: { count: 0 },
        issues: { count: 0 },
        list: [],
      },
    );

    if (
      week.issues.count === velocityIssues &&
      week.points.count === velocityPoints
    ) {
      return week;
    }
    let weekCompletedPoints = 0;
    if (
      currentRemainingPoints > 0 &&
      overallWeekCompletion.points.count === 0
    ) {
      // There are remaining points for the initiative and no points already assigned to the week
      weekCompletedPoints =
        velocityPoints > currentRemainingPoints
          ? currentRemainingPoints
          : velocityPoints;
      currentRemainingPoints = currentRemainingPoints - weekCompletedPoints;
    } else if (
      currentRemainingPoints > 0 &&
      overallWeekCompletion.points.count > 0
    ) {
      // There are remaining points for the initiative but some points have already been assigned to the week from other initiatives
      const maxRemainingPoints =
        velocityPoints - overallWeekCompletion.points.count;
      weekCompletedPoints =
        maxRemainingPoints > currentRemainingPoints
          ? currentRemainingPoints
          : maxRemainingPoints;
      currentRemainingPoints = currentRemainingPoints - weekCompletedPoints;
    }

    let weekCompletedIssues = 0;
    if (
      currentRemainingIssues > 0 &&
      overallWeekCompletion.issues.count === 0
    ) {
      // There are remaining issues for the initiative and no issues already assigned to the week
      weekCompletedIssues =
        velocityIssues > currentRemainingIssues
          ? currentRemainingIssues
          : velocityIssues;
      currentRemainingIssues = currentRemainingIssues - weekCompletedIssues;
    } else if (
      currentRemainingIssues > 0 &&
      overallWeekCompletion.issues.count > 0
    ) {
      // There are remaining issues for the initiative but some issues have already been assigned to the week from other initiatives
      const maxRemainingIssues =
        velocityIssues - overallWeekCompletion.issues.count;
      weekCompletedIssues =
        maxRemainingIssues > currentRemainingIssues
          ? currentRemainingIssues
          : maxRemainingIssues;
      currentRemainingIssues = currentRemainingIssues - weekCompletedIssues;
    }

    return {
      ...week,
      points: { count: weekCompletedPoints },
      issues: { count: weekCompletedIssues },
      list: overallWeekCompletion.list,
    };
  });
};

const crunchRoadmap = (
  emptyRoadmap: any,
  teamsVelocity: Array<any>,
  openInitiatives: Array<any>,
) => {
  // Start with processing initiatives by team
  const initiativesRoadmap: Array<any> = [];
  for (const team of teamsVelocity) {
    // We filter out initiatives without assignees as well as initiatives not related to the team
    const teamInitiatives = openInitiatives
      .filter(i => i.fields.assignee !== null)
      .filter(i => i.fields.status.statusCategory.name !== 'Done')
      .filter(i => getTeamId(i.fields.assignee.name) === getTeamId(team.team));
    for (const initiative of teamInitiatives) {
      // Start naive, add the calendar and completion into a template
      const teamInitiative = {
        ...initiative,
        team,
        weeks: fillWeek(
          emptyRoadmap,
          team.velocity.issues.current,
          initiative.metrics.issues.remaining,
          team.velocity.points.current,
          initiative.metrics.points.remaining,
          initiativesRoadmap.filter(
            i => getTeamId(i.team.team) === getTeamId(team.team),
          ),
          teamInitiatives,
        ),
      };
      initiativesRoadmap.push(teamInitiative);
    }
  }
  return initiativesRoadmap;
};

export default crunchRoadmap;
