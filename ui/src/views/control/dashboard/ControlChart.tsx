import React from 'react';
import ControlChartStacked from '../../../components/Charts/ChartJS/ControlChartStacked';

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
    <ControlChartStacked
      dataset={dataset}
      buckets={control.buckets}
      jiraHost={control.host}
      jqlCompletion={control.jqlCompletion}
    />
  );
}
