import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as loadJsonFile from 'load-json-file';

import { ConfigService } from '../config.service';

export const getTeamId = (teamName: string) => {
  return String(teamName)
    .replace('team-', '') // If team is prefixed by team-, we simply remove it from the string
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);
  configBasePath: string;

  constructor(config: ConfigService) {
    this.configBasePath = config.get('CONFIG_DIR');
  }

  async getHistory(initiativeKey: string): Promise<any> {
    const emptyCompletion = {
      issues: { count: 0, focus: 0 },
      points: { count: 0, focus: 0 },
      list: [],
    };

    // Get list of initiatives files
    const cacheDir = this.configBasePath + '/cache/';
    const latestInitiativesData: any = loadJsonFile.sync(
      cacheDir + 'initiatives-artifacts.json',
    );
    const actualInitiativeData = latestInitiativesData.initiatives.find(
      i => i.key === initiativeKey,
    );
    const teamId = getTeamId(actualInitiativeData.assignee.name);
    const teamVelocityData: any = loadJsonFile.sync(
      cacheDir + 'velocity-artifacts-' + teamId + '.json',
    );

    /* Other initiatives worked on by the team */
    const otherInitiatives = latestInitiativesData.initiatives.filter(
      (i: any) =>
        i.key !== initiativeKey &&
        i.assignee !== null &&
        getTeamId(i.assignee.name) === teamId,
    );

    const teamWeeks: Array<any> = [];
    /* Populate the array with rough data coming from the team velocity and the initiative */
    for (const week of teamVelocityData.weeks) {
      //      console.log(week);
      const initiativeCompletion = JSON.parse(JSON.stringify(emptyCompletion));
      const initiativeWeek = actualInitiativeData.weeks.find(
        (w: any) => w.weekTxt === week.weekTxt,
      );
      if (initiativeWeek !== undefined) {
        initiativeCompletion.list = initiativeWeek.list.map((i: any) => i.key);
        initiativeCompletion.issues.count = initiativeWeek.issues.count;
        initiativeCompletion.points.count = initiativeWeek.points.count;
        if (initiativeWeek.issues.count > 0) {
          initiativeCompletion.issues.focus = Math.round(
            (initiativeWeek.issues.count * 100) / week.completion.issues.count,
          );
        }
        if (initiativeWeek.points.count > 0) {
          initiativeCompletion.points.focus = Math.round(
            (initiativeWeek.points.count * 100) / week.completion.points.count,
          );
        }
      }

      // With other initiatives, we record the effort spent by the same team on other initiatives
      const otherInitiativesCompletion = JSON.parse(
        JSON.stringify(emptyCompletion),
      );
      for (const otherInitiative of otherInitiatives) {
        const otherInitiativeWeek = otherInitiative.weeks.find(
          (w: any) => w.weekTxt === week.weekTxt,
        );
        if (otherInitiativeWeek !== undefined) {
          otherInitiativesCompletion.list = [
            ...otherInitiativesCompletion.list,
            ...otherInitiativeWeek.list.map((i: any) => i.key),
          ];
          otherInitiativesCompletion.issues.count =
            otherInitiativesCompletion.issues.count +
            otherInitiativeWeek.issues.count;
          otherInitiativesCompletion.points.count =
            otherInitiativesCompletion.points.count +
            otherInitiativeWeek.points.count;
        }
      }

      /* Fill in non-initiatives completion */
      const nonInitiativesCompletion = JSON.parse(
        JSON.stringify(emptyCompletion),
      );
      // Populate an array containing all issues in team completion but not in initiatives nor nonInitiatives
      nonInitiativesCompletion.list = week.completion.list.filter(
        (akey: string) =>
          initiativeCompletion.list.find((bkey: string) => akey === bkey) ===
            undefined &&
          otherInitiativesCompletion.list.find(
            (bkey: string) => akey === bkey,
          ) === undefined,
      );
      nonInitiativesCompletion.issues.count =
        nonInitiativesCompletion.list.length;

      // Search points for nonInitiatives by looking in orphaned issues
      const orphanedIssuesWeek = latestInitiativesData.orphanIssues.find(
        (w: any) => w.weekTxt === week.weekTxt,
      );
      nonInitiativesCompletion.points.count = nonInitiativesCompletion.list.reduce(
        (acc, issueKey) => {
          let points = 0;
          if (orphanedIssuesWeek !== undefined) {
            const issueFound = orphanedIssuesWeek.list.find(
              (i: any) => i.key === issueKey,
            );
            if (issueFound !== undefined) {
              points = issueFound.points;
            }
          }
          return acc + points;
        },
        0,
      );

      if (otherInitiativesCompletion.issues.count > 0) {
        otherInitiativesCompletion.issues.focus = Math.round(
          (otherInitiativesCompletion.issues.count * 100) /
            week.completion.issues.count,
        );
      }
      if (otherInitiativesCompletion.points.count > 0) {
        otherInitiativesCompletion.points.focus = Math.round(
          (otherInitiativesCompletion.points.count * 100) /
            week.completion.points.count,
        );
      }

      teamWeeks.push({
        weekStart: week.weekStart,
        weekEnd: week.weekEnd,
        weekNb: week.weekNb,
        weekTxt: week.weekTxt,
        weekJira: week.weekJira,
        teamCompletion: week.completion,
        initiativeCompletion: initiativeCompletion,
        otherInitiativesCompletion: otherInitiativesCompletion,
        nonInitiativesCompletion: nonInitiativesCompletion,
      });
    }

    /* Bruteforce => Remove empty weeks at the beginning of the array  */
    const removeLeadingWeeks = [];
    for (const [idx, week] of teamWeeks.entries()) {
      if (
        (week.initiativeCompletion.points.count > 0 &&
          removeLeadingWeeks.length === 0) ||
        removeLeadingWeeks.length > 0
      ) {
        removeLeadingWeeks.push(week);
      }
    }

    /* Bruteforce => Remove empty weeks at the end of the array */
    const cleanedTeamWeeks = [];
    for (const [idx, week] of removeLeadingWeeks.entries()) {
      if (
        cleanedTeamWeeks.length === 0 ||
        week.initiativeCompletion.points.count > 0
      ) {
        cleanedTeamWeeks.push(week);
      } else if (week.initiativeCompletion.points.count === 0) {
        // If the current item completion is 0, look in the rest of the array for non zero values
        const remainder = removeLeadingWeeks.slice(
          idx,
          removeLeadingWeeks.length,
        );
        const pointsInRemainder = remainder
          .map(week => week.initiativeCompletion.points.count)
          .reduce((acc, count) => acc + count, 0);
        if (pointsInRemainder > 0) {
          cleanedTeamWeeks.push(week);
        }
      }
    }

    // From there, we decorate the week with historical data
    const historyFiles = fs
      .readdirSync(cacheDir)
      .filter((file: string) => file.includes('initiatives-artifacts-')) // Look for all .clear files
      .filter((file: string) => !file.includes('raw'));

    const fullTeamWeeks = cleanedTeamWeeks.map((week: any) => {
      let history = null;
      const historyWeekFile = historyFiles.find((archiveFile: string) =>
        archiveFile.includes(week.weekEnd),
      );
      if (historyWeekFile !== undefined) {
        const historyInitiativesData: any = loadJsonFile.sync(
          cacheDir + historyWeekFile,
        );
        const historyInitiative = historyInitiativesData.initiatives.find(
          i => i.key === initiativeKey,
        );
        const emptyMetrics = {
          issues: {
            completed: 0,
            remaining: 0,
            total: 0
          },
          points: {
            completed: 0,
            remaining: 0,
            missing: 0,
            total: 0
          }
        };
        history = { metrics: historyInitiative === undefined ? emptyMetrics : historyInitiative.metrics };

        const forecastInitiative = historyInitiativesData.futureCompletion.find(
          i => i.key === initiativeKey,
        );
        if (
          forecastInitiative !== undefined &&
          forecastInitiative.weeks.length > 0
        ) {
          history = {
            ...history,
            forecast:
              forecastInitiative.weeks[forecastInitiative.weeks.length - 1],
          };
        }
      }
      return {
        ...week,
        history,
      };
    });
    return fullTeamWeeks;
  }
}
