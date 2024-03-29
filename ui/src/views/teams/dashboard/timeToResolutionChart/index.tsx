import React, { FC, useRef } from 'react';
import { startOfMonth, format, sub } from 'date-fns';
import toMaterialStyle from 'material-color-hash';
import { mean } from 'simple-statistics';

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
import { Chart } from 'react-chartjs-2';

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

const MeanTimeToResolution: FC<any> = ({
  completionStreams,
  positiveResolutions,
  negativeResolutions,
  ignoreResolutions,
  rollingWindow,
}) => {
  if (completionStreams.length === 0) {
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
      for (const s of completionStreams) {
        for (const d of s.days) {
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
      }
      acc.push({
        monthStart: m,
        issues: closedIssues,
      });
      return acc;
    },
    [],
  );

  const monthsRolling = monthsFilled.reduce(
    (acc: Array<any>, m: any, idx: number) => {
      const movingIssues: Array<any> = [];
      // Push issues for the current month
      for (let i = 0; i < rollingWindow; i++) {
        if (idx - i >= 0) {
          movingIssues.push(...monthsFilled[idx - i].issues);
        }
      }
      acc.push({
        ...m,
        issues: movingIssues,
      });
      return acc;
    },
    [],
  );

  const monthsCumulative = monthsFilled.reduce(
    (acc: Array<any>, m: any, idx: number) => {
      const movingIssues: Array<any> = [];
      // Push issues for the current month
      for (let i = 0; i < monthsFilled.length; i++) {
        if (idx - i >= 0) {
          movingIssues.push(...monthsFilled[idx - i].issues);
        }
      }
      acc.push({
        ...m,
        issues: movingIssues,
      });
      return acc;
    },
    [],
  );

  const labels = monthsFilled.map((m: any) => format(m.monthStart, 'LLL yyyy'));

  const datasets = [];
  if (positiveResolutions.length > 0) {
    datasets.push({
      type: 'bar' as const,
      label: 'Positive Outcome',
      data: monthsFilled.map((m: any) => {
        const monthIssues = m.issues
          .filter((i: any) => positiveResolutions.includes(i.fields.resolution))
          .map((i: any) => i.openedForDays);
        return monthIssues.length === 0 ? null : Math.round(mean(monthIssues));
      }),
      backgroundColor: toMaterialStyle('Positive Outcome', 200).backgroundColor,
      borderColor: toMaterialStyle('Positive Outcome', 200).backgroundColor,
    });
  }
  if (negativeResolutions.length > 0) {
    datasets.push({
      type: 'bar' as const,
      label: 'Negative Outcome',
      data: monthsFilled.map((m: any) => {
        const monthIssues = m.issues
          .filter((i: any) => negativeResolutions.includes(i.fields.resolution))
          .map((i: any) => i.openedForDays);
        return monthIssues.length === 0 ? null : Math.round(mean(monthIssues));
      }),
      backgroundColor: toMaterialStyle('Negative Outcome', 200).backgroundColor,
      borderColor: toMaterialStyle('Negative Outcome', 200).backgroundColor,
    });
  }

  const chartData = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'Overall MMTR (Rolling)',
        data: monthsRolling.map((m: any) => {
          const monthIssues = m.issues.map((i: any) => i.openedForDays);
          return monthIssues.length === 0
            ? null
            : Math.round(mean(monthIssues));
        }),
        backgroundColor: toMaterialStyle('Rolling', 200).backgroundColor,
        borderColor: toMaterialStyle('Rolling', 200).backgroundColor,
      },
      {
        type: 'line' as const,
        label: 'Overall MMTR (Cumulative)',
        data: monthsCumulative.map((m: any) => {
          const monthIssues = m.issues.map((i: any) => i.openedForDays);
          return monthIssues.length === 0
            ? null
            : Math.round(mean(monthIssues));
        }),
        backgroundColor: toMaterialStyle('Cumulative', 200).backgroundColor,
        borderColor: toMaterialStyle('Cumulative', 200).backgroundColor,
      },
      {
        type: 'bar' as const,
        label: 'Overall MMTR',
        data: monthsFilled.map((m: any) => {
          const monthIssues = m.issues.map((i: any) => i.openedForDays);
          return monthIssues.length === 0
            ? null
            : Math.round(mean(monthIssues));
        }),
        backgroundColor: toMaterialStyle('Overall', 200).backgroundColor,
        borderColor: toMaterialStyle('Overall', 200).backgroundColor,
      },
      ...datasets,
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
        title: {
          display: true,
          text: 'Mean time to resolution (days)',
        },
      },
    },
  };

  const chartRef = useRef<ChartJS>(null);

  return <Chart ref={chartRef} type="bar" options={options} data={chartData} />;
};

export default MeanTimeToResolution;
