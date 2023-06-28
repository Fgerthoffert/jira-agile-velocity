import { startOfWeek, isEqual, differenceInWeeks, sub } from 'date-fns';

import {
  CompletionData,
  CompletionStream,
  CompletionDay,
  JiraIssue,
} from '../../global';

import { getEmptyCalendar } from './getEmptyCalendar';

interface CompletionWeek {
  firstDay: Date;
  issues: Array<JiraIssue>;
  metrics: {
    issues: {
      count: number;
      velocity: number;
    };
    points: {
      count: number;
      velocity: number;
    };
  };
}

// From completion data, format the streams with the actual velocity
export const getCompletionStreams = (
  completionData: CompletionData,
  completionWindowMonths: number,
) => {
  console.log('[Teams] Calculating Teams completion streams');
  const velocityWeeks = 4;
  const emptyCalendar = getEmptyCalendar(
    new Date(completionData.from),
    new Date(),
  );
  return completionData.completion.map((s: CompletionStream) => {
    const issues = s.issues.map(i => {
      const days = s.days.map(d => {
        return {
          day: d.day,
          issues: d.issues.filter(di => i.issues.includes(di.key)),
        };
      });
      const emptyCalendarSub = getEmptyCalendar(
        sub(new Date(), { months: completionWindowMonths }),
        new Date(),
      );
      return {
        ...i,
        weeks: emptyCalendarSub.map((w: CompletionWeek) => {
          const completedDays = days.filter((d: CompletionDay) =>
            isEqual(startOfWeek(new Date(d.day)), w.firstDay),
          );
          const completedIssues = completedDays.reduce(
            (acc: Array<JiraIssue>, day: CompletionDay) => {
              return [...acc, ...day.issues];
            },
            [],
          );

          // Gather data for velocity window
          const velocityDays = s.days.filter(
            (d: CompletionDay) =>
              new Date(d.day) < w.firstDay &&
              differenceInWeeks(w.firstDay, startOfWeek(new Date(d.day))) <=
                velocityWeeks,
          );
          const velocityIssues = velocityDays.reduce(
            (acc: Array<JiraIssue>, day: CompletionDay) => {
              return [...acc, ...day.issues];
            },
            [],
          );
          return {
            ...w,
            issues: completedIssues,
            completed: {
              days: completedDays,
              issues: completedIssues,
            },
            velocity: {
              days: velocityDays,
              issues: velocityIssues,
            },
            metrics: {
              issues: {
                count: completedIssues.length,
                velocity: velocityIssues.length / velocityWeeks,
              },
              points: {
                count: completedIssues
                  .map((j: JiraIssue) => j.points)
                  .reduce((acc: number, value: number) => acc + value, 0),
                velocity:
                  velocityIssues
                    .map((j: JiraIssue) => j.points)
                    .reduce((acc: number, value: number) => acc + value, 0) /
                  velocityWeeks,
              },
            },
          };
        }),
      };
    });

    return {
      ...s,
      issues,
      days: s.days.map(d => {
        return { ...d, day: new Date(d.day) };
      }),
      weeks: emptyCalendar.map((w: CompletionWeek) => {
        // Filter by days completed during that week
        const completedDays = s.days.filter((d: CompletionDay) =>
          isEqual(startOfWeek(new Date(d.day)), w.firstDay),
        );
        const completedIssues = completedDays.reduce(
          (acc: Array<JiraIssue>, day: CompletionDay) => {
            return [...acc, ...day.issues];
          },
          [],
        );

        // Gather data for velocity window
        const velocityDays = s.days.filter(
          (d: CompletionDay) =>
            new Date(d.day) < w.firstDay &&
            differenceInWeeks(w.firstDay, startOfWeek(new Date(d.day))) <=
              velocityWeeks,
        );
        const velocityIssues = velocityDays.reduce(
          (acc: Array<JiraIssue>, day: CompletionDay) => {
            return [...acc, ...day.issues];
          },
          [],
        );
        return {
          ...w,
          completed: {
            days: completedDays,
            issues: completedIssues,
          },
          velocity: {
            days: velocityDays,
            issues: velocityIssues,
          },
          metrics: {
            issues: {
              count: completedIssues.length,
              velocity: velocityIssues.length / velocityWeeks,
            },
            points: {
              count: completedIssues
                .map((j: JiraIssue) => j.points)
                .reduce((acc: number, value: number) => acc + value, 0),
              velocity:
                velocityIssues
                  .map((j: JiraIssue) => j.points)
                  .reduce((acc: number, value: number) => acc + value, 0) /
                velocityWeeks,
            },
          },
        };
      }),
    };
  });
};
