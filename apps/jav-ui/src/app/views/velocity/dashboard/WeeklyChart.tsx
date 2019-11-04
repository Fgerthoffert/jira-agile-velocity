import React from 'react';
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

  const datasetWithDays = dataset.map((week: any) => {
    const weekDays = velocity.days.filter((d: any) => d.weekTxt === week.weekTxt);
    return { ...week, weekDays };
  });
  return (
    <VelocityChartStacked
      dataset={datasetWithDays}
      defaultPoints={defaultPoints}
      jiraHost={velocity.host}
      jqlCompletion={velocity.jqlCompletion}
    />
  );
}
