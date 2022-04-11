import React, { FC, MouseEvent, useRef } from 'react';
import type { InteractionItem } from 'chart.js';

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
import {
  Chart,
  getDatasetAtEvent,
  getElementAtEvent,
  getElementsAtEvent,
} from 'react-chartjs-2';

import randomColor from 'randomcolor';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
);

const VelocityChart: FC<any> = ({ completionData, metric, chartRange }) => {
  const allCompletion = completionData.find((c: any) => c.key === 'all');

  if (allCompletion === undefined) {
    return null;
  }

  let displayKey = 'weekTxt';
  let displayRecords = 32;
  if (chartRange === 'days') {
    displayKey = 'weekDayJira';
    displayRecords = 40;
  }

  const labels = allCompletion[chartRange]
    .slice(Math.max(allCompletion[chartRange].length - displayRecords, 0))
    .map((w: any) => w[displayKey]);

  const datasets = completionData.map((d: any) => {
    return {
      label: d.name === undefined ? 'Other' : d.name,
      data: d[chartRange]
        .slice(Math.max(allCompletion[chartRange].length - displayRecords, 0))
        .map((w: any) => {
          // If the current key is all, we substract from the value,
          // the sum of all other values in categories for the same week
          if (d.key === 'all') {
            let currentCount = w.completion[metric].count;
            for (const dset of completionData.filter(
              (d: any) => d.key !== 'all',
            )) {
              for (const week of dset[chartRange]
                .slice(
                  Math.max(
                    allCompletion[chartRange].length - displayRecords,
                    0,
                  ),
                )
                .filter((wf: any) => wf[displayKey] === w[displayKey])) {
                currentCount = currentCount - week.completion[metric].count;
              }
            }
            if (currentCount < 0) {
              currentCount = 0;
            }
            return currentCount;
          }
          return w.completion[metric].count;
        }),
      backgroundColor: randomColor({
        luminosity: 'bright',
        format: 'rgb',
        seed: d.name === undefined ? '_Other_' : d.name,
      }),
      stack: 'Stack 0',
    };
  });

  const data = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'All',
        pointStyle: 'triangle',
        borderWidth: 0,
        data: allCompletion[chartRange]
          .slice(Math.max(allCompletion[chartRange].length - displayRecords, 0))
          .map((w: any) => w.completion[metric].count),
        backgroundColor: randomColor({
          luminosity: 'dark',
          format: 'rgb',
          seed: 'All',
        }),
        stack: 'Stack 1',
      },
      {
        type: 'line' as const,
        label: 'Velocity',
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        fill: false,
        data: allCompletion[chartRange]
          .slice(Math.max(allCompletion[chartRange].length - displayRecords, 0))
          .map((w: any) => w.completion[metric].velocity),
      },
      ...datasets,
    ],
  };

  const chartRef = useRef<ChartJS>(null);

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Bar Chart - Stacked',
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
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
    let clickedDataset: any = allCompletion;
    for (const dts of completionData) {
      if (dts.name === datasetName) {
        clickedDataset = dts;
      }
    }

    // Get the label of the element clicked
    const elAtEvent = getElementAtEvent(chart, event);
    const { index } = elAtEvent[0];
    const xAxis = data.labels[index];

    // From there, get the datapoint clicked
    const clickedPoint = clickedDataset[chartRange].find(
      (d: any) => d[displayKey] === xAxis,
    );

    const url =
      clickedDataset.host +
      '/issues/?jql=key in (' +
      clickedPoint.completion.list.join() +
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

export default VelocityChart;
