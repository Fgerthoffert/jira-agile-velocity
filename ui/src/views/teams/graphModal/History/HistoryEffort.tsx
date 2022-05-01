import React, { FC, useRef } from 'react';

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
import { format } from 'date-fns';
import toMaterialStyle from 'material-color-hash';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
);

const HistoryEffort: FC<any> = ({ historyMetrics, metric }) => {
  const labels = historyMetrics.map((d: any) =>
    format(new Date(d.updatedAt), 'LLL do'),
  );

  const datasets = [
    {
      label: 'Total',
      data: historyMetrics.map((h: any) => h.metrics[metric].total),
      backgroundColor: toMaterialStyle('Total', 200).backgroundColor,
      borderColor: toMaterialStyle('Total', 200).backgroundColor,
    },
    {
      label: 'Completed',
      data: historyMetrics.map((h: any) => h.metrics[metric].completed),
      backgroundColor: toMaterialStyle('Completed', 200).backgroundColor,
      borderColor: toMaterialStyle('Completed', 200).backgroundColor,
    },
    {
      label: 'Remaining',
      data: historyMetrics.map((h: any) => h.metrics[metric].completed),
      backgroundColor: toMaterialStyle('Remaining', 200).backgroundColor,
      borderColor: toMaterialStyle('Remaining', 200).backgroundColor,
    },
  ];

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
    },
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: metric,
        },
      },
    },
  };

  return <Chart ref={chartRef} type="line" options={options} data={data} />;
};

export default HistoryEffort;
