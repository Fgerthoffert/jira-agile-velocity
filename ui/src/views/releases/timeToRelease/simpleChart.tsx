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

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
);

const SimpleChart: FC<any> = ({ data }) => {
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
          text: 'months',
        },
      },
    },
  };

  return <Chart ref={chartRef} type="bar" options={options} data={data} />;
};

export default SimpleChart;
