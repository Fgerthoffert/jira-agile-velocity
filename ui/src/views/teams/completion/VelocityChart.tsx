import React, { FC, useRef } from 'react';

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

const VelocityChart: FC<any> = ({ completionStreams, metric }) => {
  const labels = completionStreams[0].weeks.map((w: any) =>
    format(w.firstDay, 'LLL do'),
  );

  const datasets = completionStreams.map((s: any) => {
    return {
      label: s.name,
      data: s.weeks.map((w: any) => w.metrics[metric].velocity),
      backgroundColor: toMaterialStyle(s.name, 200).backgroundColor,
      borderColor: toMaterialStyle(s.name, 200).backgroundColor,
      // stack: 'abc',
    };
  });

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

export default VelocityChart;
