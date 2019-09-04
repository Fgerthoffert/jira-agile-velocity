import React from 'react';
import VelocityChart from '../../../components/Charts/ChartJS/VelocityChart';

export interface WeeklyChartsProps {
  velocity: any;
  defaultPoints: any;
}

export default function WeeklyChart(props: WeeklyChartsProps) {
  const { velocity, defaultPoints } = props;
  const itemsToDisplay = 40;
  const startPos =
    itemsToDisplay > velocity.days.length
      ? 0
      : velocity.days.length - itemsToDisplay;
  const dataset = velocity.days
    .slice(startPos, velocity.days.length)
    .map((day: any) => {
      return {
        ...day,
        legend: day.date.slice(5, 10)
      };
    });

  return <VelocityChart dataset={dataset} defaultPoints={defaultPoints} />;
}
