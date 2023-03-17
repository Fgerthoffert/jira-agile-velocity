import React, { FC, useRef } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { format } from 'date-fns';

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
import {
  BoxPlotController,
  BoxAndWiskers,
} from '@sgratzl/chartjs-chart-boxplot';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  BoxPlotController,
  BoxAndWiskers,
);

import { RootState } from '../../../store';

const DistributionChart = () => {
  const chartRef = useRef<ChartJS>(null);

  const monthsReleases = useSelector(
    (state: RootState) => state.versions.monthsReleases,
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
        label: `Monthly distribution`,
        data: monthsReleases.map(
          (m: any) => m.stats.current.monthsToRelease.datapoints,
        ),
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
        Mean time to Release distribution
      </Typography>
      <Chart
        ref={chartRef}
        type="boxplot"
        options={chartOptions}
        data={chartData}
      />
      <Typography component="p">
        This box plot displays the distribution of released issues for each
        month.
      </Typography>
    </Paper>
  );
};

export default DistributionChart;
