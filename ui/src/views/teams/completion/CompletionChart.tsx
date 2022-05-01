import React, { FC, MouseEvent, useRef } from 'react';

import 'chart.js/auto';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
} from 'chart.js';
import { Chart, getDatasetAtEvent, getElementAtEvent } from 'react-chartjs-2';
import { format } from 'date-fns';
import toMaterialStyle from 'material-color-hash';
import { JiraIssue } from '../../../global';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
);

const CompletionChart: FC<any> = ({ completionStreams, metric, jiraHost }) => {
  const labels = completionStreams[0].weeks.map((w: any) =>
    format(w.firstDay, 'LLL do'),
  );

  const datasets = completionStreams.map((s: any) => {
    return {
      label: s.name,
      data: s.weeks.map((w: any) => w.metrics[metric].count),
      backgroundColor: toMaterialStyle(s.name, 200).backgroundColor,
      stack: 'Stack 0',
    };
  });

  if (completionStreams.length > 0) {
    datasets.unshift({
      type: 'line' as const,
      label: 'Velocity (All)',
      borderWidth: 2,
      data: completionStreams[0].weeks.map(
        (w: any) => w.metrics[metric].totalStreams,
      ),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgb(255, 99, 132)',
      stack: 'Stack 1',
    });
  }

  const data = {
    labels,
    datasets,
  };

  const chartRef = useRef<ChartJS>(null);

  const options = {
    plugins: {
      title: {
        display: true,
      },
      legend: {
        labels: {
          filter: (item: any) => {
            return item.text != 'Velocity (All)';
          },
        },
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: metric,
        },
      },
    },
  };

  const onClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const { current: chart } = chartRef;

    if (!chart) {
      return;
    }

    // Get dataset name, and if it doesn't match a name
    // fallback to "All"
    const fullDataset = getDatasetAtEvent(chart, event);
    const datasetIndex = fullDataset[0].datasetIndex;
    const datasetName = data.datasets[datasetIndex].label;
    const clickedDataset = completionStreams.find(
      (s: any) => s.name === datasetName,
    );

    // Get the label of the element clicked
    const elAtEvent = getElementAtEvent(chart, event);
    const { index } = elAtEvent[0];
    const xAxis = data.labels[index];

    // From there, get the datapoint clicked
    const clickedPoint = clickedDataset.weeks.find(
      (w: any) => format(w.firstDay, 'LLL do') === xAxis,
    );

    const url =
      jiraHost +
      '/issues/?jql=key in (' +
      clickedPoint.completed.issues.map((i: JiraIssue) => i.key).join() +
      ')';

    window.open(url, '_blank');
  };

  return (
    <Chart
      ref={chartRef}
      onClick={onClick}
      type="bar"
      options={options}
      data={data}
    />
  );
};

export default CompletionChart;
