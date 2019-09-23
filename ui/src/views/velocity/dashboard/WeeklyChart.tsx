import React from 'react';
import parseISO from 'date-fns/parseISO';
import VelocityChartStacked from '../../../components/Charts/ChartJS/VelocityChartStacked';

export interface WeeklyChartsProps {
  velocity: any;
  defaultPoints: any;
}

export default function WeeklyChart(props: WeeklyChartsProps) {
  const { velocity, defaultPoints } = props;

  const itemsToDisplay = 16;
  const startPos =
    itemsToDisplay > velocity.weeks.length
      ? 0
      : velocity.weeks.length - itemsToDisplay;

  const dataset = velocity.weeks
    .slice(startPos, velocity.weeks.length)
    .map((week: any) => {
      return {
        ...week,
        legend: week.weekTxt
      };
    });

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  const datasetWithDays = dataset.map((week: any) => {
    const weekDays = [];
    // @ts-ignore
    for (const [idx, day] of days.entries()) {
      const issuesList = week.completion.list.filter((issue: any) => {
        //          console.log(issue);
        const issueDate = parseISO(issue.closedAt);
        if (issueDate.getDay() === idx) {
          return true;
        }
        return false;
      });
      weekDays.push({
        weekdayTxt: day,
        list: issuesList,
        date: issuesList.length === 0 ? null : parseISO(issuesList[0].closedAt),
        jql: issuesList.length === 0 ? null : issuesList[0].jql,
        completion: {
          issues: {
            count: issuesList.length
          },
          points: {
            count: issuesList
              .map((i: any) => i.points)
              .reduce((acc: number, count: number) => acc + count, 0)
          }
        }
      });
    }
    return { ...week, weekDays };
  });

  return (
    <VelocityChartStacked
      dataset={datasetWithDays}
      defaultPoints={defaultPoints}
    />
  );
}
