import React, { FC, useRef } from 'react';
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

const OpenVsClosed: FC<any> = ({
  streamKey,
  forecastStreams,
  completionStreams,
}) => {
  if (forecastStreams.length === 0 || completionStreams === 0) {
    return <span>Not enough data available</span>;
  }

  // Create an array of months over the past 12 months
  const months = getMonthsBetweenDates(
    startOfMonth(sub(new Date(), { months: 12 })),
    startOfMonth(new Date()),
  );

  const monthsFilled = months
    .reduce((acc: Array<any>, m: Date, idx: number) => {
      const monthData: any = {
        monthStart: m,
        opened: {
          points: 0,
          issues: [],
        },
        closed: {
          points: 0,
          issues: [],
        },
        backlog: {
          points: 0,
          issues: [],
        },
        cumulative: {
          closed: 0,
          opened: 0,
        },
      };
      // During the first iteration, we initialize the array with opened - closed
      const openedIssues = [];
      for (const s of forecastStreams) {
        openedIssues.push(
          ...s.issues.filter(
            (i: any) =>
              startOfMonth(new Date(i.created)).getTime() === m.getTime(),
          ),
        );
      }
      let closedIssues: any = [];
      for (const s of completionStreams) {
        for (const d of s.days) {
          if (startOfMonth(new Date(d.day)).getTime() === m.getTime()) {
            for (const i of d.issues) {
              closedIssues = [...closedIssues, i];
            }
          }
        }
      }

      if (idx === 0) {
        monthData.cumulative.closed = closedIssues.length;
        monthData.cumulative.opened = openedIssues.length;
      } else {
        monthData.cumulative.closed =
          acc[idx - 1].cumulative.closed + closedIssues.length;
        monthData.cumulative.opened =
          acc[idx - 1].cumulative.opened + openedIssues.length;
      }

      monthData.opened.issues = openedIssues;
      monthData.opened.points = openedIssues
        .map((i: any) => i.points)
        .reduce((acc: any, count: any) => acc + count, 0);

      monthData.closed.issues = closedIssues;
      monthData.closed.points = closedIssues
        .map((i: any) => i.points)
        .reduce((acc: any, count: any) => acc + count, 0);

      acc.push(monthData);
      return acc;
    }, [])
    .map((m) => {
      return { ...m };
    });

  // Dataset is composed of the last 12 months
  // const dataset = monthsFilled.slice(Math.max(monthsFilled.length - 12, 0));

  const labels = monthsFilled.map((m: any) => format(m.monthStart, 'LLL yyyy'));

  const chartData = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'Backlog over 12 months',
        yAxisID: 'y',
        data: monthsFilled.map(
          (m: any) => m.cumulative.opened - m.cumulative.closed,
        ),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgb(255, 99, 132)',
      },
      // {
      //   type: 'line' as const,
      //   label: 'Half',
      //   yAxisID: 'y',
      //   data: dataset.map((m: any) => 50),
      //   borderColor: 'rgb(255, 99, 132)',
      //   backgroundColor: 'rgb(255, 99, 132)',
      //   pointRadius: 0,
      // },
      {
        // type: 'line' as const,
        label: 'Closed (count)',
        // barPercentage: 1,
        // categoryPercentage: 1,
        yAxisID: 'y1',
        data: monthsFilled.map((m: any) => m.closed.issues.length),
        backgroundColor: toMaterialStyle('closed count', 200).backgroundColor,
        borderColor: toMaterialStyle('closed count', 200).backgroundColor,
        // pointRadius: 10,
        // borderWidth: 0,
      },
      {
        // type: 'line' as const,
        label: 'New tickets (count)',
        // barPercentage: 1,
        // categoryPercentage: 1,
        yAxisID: 'y1',
        data: monthsFilled.map((m: any) => m.opened.issues.length),
        backgroundColor: toMaterialStyle('count new', 200).backgroundColor,
        borderColor: toMaterialStyle('count new', 200).backgroundColor,
        // pointRadius: 10,
        // borderWidth: 0,
      },
      // {
      //   label: 'Ratio (Closed)',
      //   barPercentage: 1,
      //   categoryPercentage: 1,
      //   stack: 'Stack 0',
      //   yAxisID: 'y',
      //   // data: dataset.map((m: any) => m.closed.issues.length),
      //   data: dataset.map((m: any) => {
      //     const totalIssues = m.closed.issues.length + m.opened.issues.length;
      //     return Math.round((m.closed.issues.length * 100) / totalIssues);
      //   }),
      //   backgroundColor: toMaterialStyle('Closed', 200).backgroundColor,
      //   borderColor: toMaterialStyle('Closed', 200).backgroundColor,
      // },
      // {
      //   label: 'Ratio (New tickets)',
      //   barPercentage: 1,
      //   categoryPercentage: 1,
      //   stack: 'Stack 0',
      //   yAxisID: 'y',
      //   // data: dataset.map((m: any) => m.opened.issues.length),
      //   data: dataset.map((m: any) => {
      //     const totalIssues = m.closed.issues.length + m.opened.issues.length;
      //     return Math.round((m.opened.issues.length * 100) / totalIssues);
      //   }),
      //   backgroundColor: toMaterialStyle('Opened', 200).backgroundColor,
      //   borderColor: toMaterialStyle('Opened', 200).backgroundColor,
      // },
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
        position: 'right' as const,
        max: 100,
        title: {
          display: true,
          text: 'Backlog over 12 months',
        },
      },
      y1: {
        position: 'left',
        title: {
          display: true,
          text: 'Ticket Count',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const chartRef = useRef<ChartJS>(null);

  return <Chart ref={chartRef} type="bar" options={options} data={chartData} />;
};

export default OpenVsClosed;
