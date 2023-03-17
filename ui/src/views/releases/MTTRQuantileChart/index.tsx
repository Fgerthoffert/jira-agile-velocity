import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { format } from 'date-fns';
import toMaterialStyle from 'material-color-hash';

import { RootState } from '../../../store';

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

const QuantileChart = () => {
  const chartRef = useRef<ChartJS>(null);

  const monthsReleases = useSelector(
    (state: RootState) => state.versions.monthsReleases,
  );
  const rollingWindow = useSelector(
    (state: RootState) => state.versions.rollingWindow,
  );

  if (monthsReleases.length === 0) {
    return null;
  }

  const labels = monthsReleases.map((m: any) =>
    format(m.monthStart, 'LLL yyyy'),
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'MTTR at 75% per month',
        data: monthsReleases.map(
          (m: any) => m.stats.current.monthsToRelease.quantiles[75].value,
        ),
        backgroundColor: toMaterialStyle('75%', 200).backgroundColor,
        borderColor: toMaterialStyle('75%', 200).backgroundColor,
      },
      {
        type: 'line' as const,
        label: 'MTTR at 75% rolling',
        borderWidth: 2,
        data: monthsReleases.map(
          (m: any) => m.stats.rolling.monthsToRelease.quantiles[75].value,
        ),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgb(255, 99, 132)',
      },
    ],
  };

  const chartOptions = {
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

  return (
    <Paper>
      <Typography variant="h6" component="h6">
        Mean time to Release, 75% quantile
      </Typography>
      <Chart
        ref={chartRef}
        type="bar"
        options={chartOptions}
        data={chartData}
      />
      <Typography component="p">
        Displays the 75% quantile per month and using a {rollingWindow} months
        rolling window.
      </Typography>
    </Paper>
  );
};

export default QuantileChart;
