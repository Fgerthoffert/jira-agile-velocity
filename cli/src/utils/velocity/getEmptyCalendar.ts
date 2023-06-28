import { startOfWeek, add } from 'date-fns';

import { JiraIssue } from '../../global';

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

// Build an empty calendar of weeks
export const getEmptyCalendar = (from: Date, to: Date) => {
  let dateCursor = startOfWeek(from);
  const weeks: Array<CompletionWeek> = [];
  while (dateCursor < to) {
    weeks.push({
      firstDay: dateCursor,
      issues: [],
      metrics: {
        issues: {
          count: 0,
          velocity: 0,
        },
        points: {
          count: 0,
          velocity: 0,
        },
      },
    });
    dateCursor = add(dateCursor, { days: 7 });
  }
  return weeks;
};
