import React from 'react';
import VelocityChart from '../../../components/Charts/ChartJS/VelocityChart';

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
  return <VelocityChart dataset={dataset} defaultPoints={defaultPoints} />;
}
