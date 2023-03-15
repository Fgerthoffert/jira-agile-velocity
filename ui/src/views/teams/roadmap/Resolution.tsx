import React, { FC, MouseEvent, useRef } from 'react';
import { startOfMonth, format, sub } from 'date-fns';
import toMaterialStyle from 'material-color-hash';

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

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
);

const getMonthsBetweenDates = (startMonth: Date, endMonth: Date) => {
  const months: Array<Date> = [];
  const currentDate = startMonth;
  while (currentDate <= endMonth) {
    if (
      !months
        .map((m) => m.getTime())
        .includes(startOfMonth(new Date(currentDate)).getTime())
    ) {
      months.push(startOfMonth(new Date(currentDate)));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return months;
};

const Resolution: FC<any> = ({
  streamKey,
  completionStreams,
  positiveResolutions,
  negativeResolutions,
  ignoreResolutions,
  jiraHost,
}) => {
  const currentCompletionStream = completionStreams.find(
    (s: any) => s.key === streamKey,
  );

  if (currentCompletionStream === undefined) {
    return <span>Not enough data available</span>;
  }

  // Create an array of months over the past 12 months
  const months = getMonthsBetweenDates(
    startOfMonth(sub(new Date(), { months: 12 })),
    startOfMonth(new Date()),
  );

  const availableResolutions: Array<string> = [];
  const monthsFilled: any = months.reduce(
    (acc: Array<any>, m: Date, idx: number) => {
      let closedIssues: any = [];
      for (const d of currentCompletionStream.days) {
        if (startOfMonth(new Date(d.day)).getTime() === m.getTime()) {
          for (const i of d.issues) {
            if (
              i.fields.resolution !== undefined &&
              !ignoreResolutions.includes(i.fields.resolution) &&
              !availableResolutions.includes(i.fields.resolution)
            ) {
              availableResolutions.push(i.fields.resolution);
            }
            closedIssues = [...closedIssues, i];
          }
        }
      }
      acc.push({
        monthStart: m,
        issues: closedIssues,
      });
      return acc;
    },
    [],
  );

  const labels = monthsFilled.map((m: any) => format(m.monthStart, 'LLL yyyy'));

  const chartData = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'Positive Outcome (%)',
        yAxisID: 'y1',
        data: monthsFilled.map((m: any) => {
          const monthIssues = m.issues.filter((i: any) =>
            positiveResolutions.includes(i.fields.resolution),
          );
          return Math.round((monthIssues.length * 100) / m.issues.length);
        }),
        backgroundColor: toMaterialStyle('Positive', 200).backgroundColor,
        borderColor: toMaterialStyle('Positive', 200).backgroundColor,
      },
      {
        type: 'line' as const,
        label: 'Negative Outcome (%)',
        yAxisID: 'y1',
        data: monthsFilled.map((m: any) => {
          const monthIssues = m.issues.filter((i: any) =>
            negativeResolutions.includes(i.fields.resolution),
          );
          return Math.round((monthIssues.length * 100) / m.issues.length);
        }),
        backgroundColor: toMaterialStyle('Negative', 200).backgroundColor,
        borderColor: toMaterialStyle('Negative', 200).backgroundColor,
      },
      ...availableResolutions.map((r: string) => {
        return {
          label: r,
          yAxisID: 'y',
          stack: 'Stack 0',
          data: monthsFilled.map((m: any) => {
            const monthIssues = m.issues.filter(
              (i: any) => i.fields.resolution === r,
            );
            return monthIssues.length;
          }),
          backgroundColor: toMaterialStyle(r, 200).backgroundColor,
          borderColor: toMaterialStyle(r, 200).backgroundColor,
        };
      }),
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
      },
    },
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    } as const,
    scales: {
      y: {
        position: 'left' as const,
        title: {
          display: true,
          text: 'Ticket count',
        },
      },
      y1: {
        position: 'right',
        max: 100,
        title: {
          display: true,
          text: '% Outcome',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const chartRef = useRef<ChartJS>(null);

  const onClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const { current: chart } = chartRef;

    if (!chart) {
      return;
    }

    // Get dataset name, and if it doesn't match a name
    const fullDataset = getDatasetAtEvent(chart, event);
    const datasetIndex = fullDataset[0].datasetIndex;
    const datasetName = chartData.datasets[datasetIndex].label;

    // Get the label of the element clicked
    const elAtEvent = getElementAtEvent(chart, event);
    const { index } = elAtEvent[0];
    const xAxis = chartData.labels[index];

    const clickedMonth = monthsFilled.find(
      (m: any) => format(m.monthStart, 'LLL yyyy') === xAxis,
    );
    const clickedIssues = clickedMonth.issues.filter(
      (i: any) => i.fields.resolution === datasetName,
    );
    if (clickedIssues.length > 0) {
      const url =
        jiraHost +
        '/issues/?jql=key in (' +
        clickedIssues.map((i: any) => i.key).join() +
        ')';
      window.open(url, '_blank');
    }
  };

  return (
    <Chart
      ref={chartRef}
      type="bar"
      onClick={onClick}
      options={options}
      data={chartData}
    />
  );
};

export default Resolution;
