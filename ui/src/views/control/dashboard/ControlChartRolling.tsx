import React from 'react';
import ControlChartRolling from '../../../components/Charts/ChartJS/ControlChartRolling';

export interface ControlChartProps {
  control: any;
}

export default function ControlChart(props: ControlChartProps) {
  const { control } = props;

  const itemsToDisplay = 32;
  const startPos =
    itemsToDisplay > control.weeks.length
      ? 0
      : control.weeks.length - itemsToDisplay;

  const dataset = control.weeks
    .slice(startPos, control.weeks.length)
    .map((week: any) => {
      return {
        ...week,
        legend: week.weekTxt
      };
    });

  return (
    <ControlChartRolling
      dataset={dataset}
      jiraHost={control.host}
      jqlCompletion={control.jqlCompletion}
    />
  );
}
