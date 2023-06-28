import { CompletionStream, JiraIssue } from '../../global';

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

// Using velocity calculated for streams, add the effort distribution
export const getStreamsDistribution = (streams: Array<any>) => {
  return streams.map((s: CompletionStream) => {
    return {
      ...s,
      weeks: s.weeks.map((w: any) => {
        // Issues Count
        const totalIssuesVelocity = streams
          .map((ts: any) => {
            const week = ts.weeks.find(
              (tw: CompletionWeek) => tw.firstDay === w.firstDay,
            );
            if (week === undefined) {
              return 0;
            }
            return week.metrics.issues.velocity;
          })
          .reduce((acc: number, value: number) => acc + value, 0);
        // Points Count
        const totalPointsVelocity = streams
          .map((ts: any) => {
            const week = ts.weeks.find((tw: any) => tw.firstDay === w.firstDay);
            if (week === undefined) {
              return 0;
            }
            return week.metrics.points.velocity;
          })
          .reduce((acc: number, value: number) => acc + value, 0);
        return {
          ...w,
          metrics: {
            issues: {
              ...w.metrics.issues,
              totalStreams: totalIssuesVelocity,
              distribution:
                w.metrics.issues.velocity === 0
                  ? 0
                  : (w.metrics.issues.velocity * 100) / totalIssuesVelocity,
            },
            points: {
              ...w.metrics.points,
              totalStreams: totalPointsVelocity,
              distribution:
                w.metrics.points.velocity === 0
                  ? 0
                  : (w.metrics.points.velocity * 100) / totalPointsVelocity,
            },
          },
        };
      }),
    };
  });
};
