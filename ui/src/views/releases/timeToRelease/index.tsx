import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { startOfMonth, format, sub } from 'date-fns';
import toMaterialStyle from 'material-color-hash';
import { median, mean, min, max, quantile } from 'simple-statistics';

import { RootState } from '../../../store';

import BoxChart from './boxChart';
import SimpleChart from './simpleChart';
import MttrTable from './mttrTable';
import IssuesModal from '../issuesModal';

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

const TimeToRelease = () => {
  const defaultPoints = useSelector(
    (state: RootState) => state.global.defaultPoints,
  );
  const versions = useSelector((state: RootState) => state.versions.versions);
  const monthsToChart = useSelector(
    (state: RootState) => state.versions.monthsToChart,
  );
  const rollingWindow = useSelector(
    (state: RootState) => state.versions.rollingWindow,
  );
  const jiraHost = useSelector((state: RootState) => state.versions.jiraHost);

  if (versions.length > 0) {
    const chartStartDate = sub(new Date(), { months: monthsToChart });
    const filteredVersions = versions.filter(
      (v: any) => new Date(v.releaseDate).getTime() > chartStartDate.getTime(),
    );

    // Look for the first and last month
    let startMonth = new Date();
    for (const v of filteredVersions) {
      if (new Date(v.releaseDate) < startMonth) {
        startMonth = startOfMonth(new Date(v.releaseDate));
      }
    }
    const months = getMonthsBetweenDates(startMonth, startOfMonth(new Date()));

    // Create a array of issues delivered for each month
    const monthsWithIssues = months.reduce((acc: Array<any>, m: Date) => {
      const releases = filteredVersions.filter(
        (v: any) =>
          m.getTime() === startOfMonth(new Date(v.releaseDate)).getTime(),
      );
      const issues = [];
      for (const r of releases) {
        for (const i of r.issues) {
          issues.push({ ...i, release: r });
        }
      }
      acc.push({
        monthStart: m,
        issues: issues,
      });
      return acc;
    }, []);

    // Create rolling average array
    const monthsMovingAverage = monthsWithIssues.reduce(
      (acc: Array<any>, month: any, idx: number) => {
        const movingIssues: Array<any> = [];
        // Push issues for the current month
        for (let i = 0; i < rollingWindow; i++) {
          if (idx - i >= 0) {
            movingIssues.push(...monthsWithIssues[idx - i].issues);
          }
        }
        const stats: any = {
          rolling: {
            monthsToRelease: {
              datapoints: movingIssues
                .filter(
                  (i) =>
                    i.daysToRelease >= 0 && i.monthsToRelease !== undefined,
                ) // Filter negatives numbers (if any)
                .map((i) => i.monthsToRelease),
              quantiles: {
                min: { value: 'N/A', issues: [] },
                max: { value: 'N/A', issues: [] },
                25: { value: 'N/A', issues: [] },
                50: { value: 'N/A', issues: [] },
                75: { value: 'N/A', issues: [] },
                90: { value: 'N/A', issues: [] },
                95: { value: 'N/A', issues: [] },
              },
            },
          },
          current: {
            monthsToRelease: {
              datapoints: month.issues
                .filter(
                  (i: any) =>
                    i.daysToRelease >= 0 && i.monthsToRelease !== undefined,
                ) // Filter negatives numbers (if any)
                .map((i: any) => i.monthsToRelease),
              quantiles: {
                min: { value: 'N/A', issues: [] },
                max: { value: 'N/A', issues: [] },
                25: { value: 'N/A', issues: [] },
                50: { value: 'N/A', issues: [] },
                75: { value: 'N/A', issues: [] },
                90: { value: 'N/A', issues: [] },
                95: { value: 'N/A', issues: [] },
              },
            },
          },
        };
        if (stats.rolling.monthsToRelease.datapoints.length > 0) {
          stats.rolling.monthsToRelease.quantiles.min.value = min(
            stats.rolling.monthsToRelease.datapoints,
          );
          stats.rolling.monthsToRelease.quantiles.max.value = max(
            stats.rolling.monthsToRelease.datapoints,
          );
          stats.rolling.monthsToRelease.quantiles[25].value = quantile(
            stats.rolling.monthsToRelease.datapoints,
            0.25,
          );
          stats.rolling.monthsToRelease.quantiles[50].value = quantile(
            stats.rolling.monthsToRelease.datapoints,
            0.5,
          );
          stats.rolling.monthsToRelease.quantiles[75].value = quantile(
            stats.rolling.monthsToRelease.datapoints,
            0.75,
          );
          stats.rolling.monthsToRelease.quantiles[90].value = quantile(
            stats.rolling.monthsToRelease.datapoints,
            0.9,
          );
          stats.rolling.monthsToRelease.quantiles[95].value = quantile(
            stats.rolling.monthsToRelease.datapoints,
            0.95,
          );
          stats.rolling.monthsToRelease.quantiles.min.issues =
            movingIssues.filter(
              (i) =>
                i.monthsToRelease ===
                stats.rolling.monthsToRelease.quantiles.min.value,
            );
          stats.rolling.monthsToRelease.quantiles.max.issues =
            movingIssues.filter(
              (i) =>
                i.monthsToRelease ===
                stats.rolling.monthsToRelease.quantiles.max.value,
            );
        }
        if (stats.current.monthsToRelease.datapoints.length > 0) {
          stats.current.monthsToRelease.quantiles.min.value = min(
            stats.current.monthsToRelease.datapoints,
          );
          stats.current.monthsToRelease.quantiles.max.value = max(
            stats.current.monthsToRelease.datapoints,
          );
          stats.current.monthsToRelease.quantiles[25].value = quantile(
            stats.current.monthsToRelease.datapoints,
            0.25,
          );
          stats.current.monthsToRelease.quantiles[50].value = quantile(
            stats.current.monthsToRelease.datapoints,
            0.5,
          );
          stats.current.monthsToRelease.quantiles[75].value = quantile(
            stats.current.monthsToRelease.datapoints,
            0.75,
          );
          stats.current.monthsToRelease.quantiles[90].value = quantile(
            stats.current.monthsToRelease.datapoints,
            0.9,
          );
          stats.current.monthsToRelease.quantiles[95].value = quantile(
            stats.current.monthsToRelease.datapoints,
            0.95,
          );
          stats.current.monthsToRelease.quantiles.min.issues =
            month.issues.filter(
              (i: any) =>
                i.monthsToRelease ===
                stats.current.monthsToRelease.quantiles.min.value,
            );
          stats.current.monthsToRelease.quantiles.max.issues =
            month.issues.filter(
              (i: any) =>
                i.monthsToRelease ===
                stats.current.monthsToRelease.quantiles.max.value,
            );
          stats.current.monthsToRelease.quantiles[25].issues =
            month.issues.filter(
              (i: any) =>
                i.monthsToRelease <=
                stats.current.monthsToRelease.quantiles[25].value,
            );
          stats.current.monthsToRelease.quantiles[50].issues =
            month.issues.filter(
              (i: any) =>
                i.monthsToRelease <=
                stats.current.monthsToRelease.quantiles[50].value,
            );
          stats.current.monthsToRelease.quantiles[75].issues =
            month.issues.filter(
              (i: any) =>
                i.monthsToRelease <=
                stats.current.monthsToRelease.quantiles[75].value,
            );
          stats.current.monthsToRelease.quantiles[90].issues =
            month.issues.filter(
              (i: any) =>
                i.monthsToRelease <=
                stats.current.monthsToRelease.quantiles[90].value,
            );
          stats.current.monthsToRelease.quantiles[95].issues =
            month.issues.filter(
              (i: any) =>
                i.monthsToRelease <=
                stats.current.monthsToRelease.quantiles[95].value,
            );
        }
        acc.push({
          ...month,
          movingIssues: movingIssues,
          stats: stats,
        });
        return acc;
      },
      [],
    );
    const labels = monthsMovingAverage.map((m: any) =>
      format(m.monthStart, 'LLL yyyy'),
    );
    const boxChartData = {
      labels,
      datasets: [
        {
          label: `Monthly distribution`,
          data: monthsMovingAverage.map(
            (m: any) => m.stats.current.monthsToRelease.datapoints,
          ),
        },
      ],
    };

    const quantileChartData = {
      labels,
      datasets: [
        {
          label: 'Current MTTR at 75%',
          data: monthsMovingAverage.map(
            (m: any) => m.stats.current.monthsToRelease.quantiles[75].value,
          ),
          backgroundColor: toMaterialStyle('75%', 200).backgroundColor,
          borderColor: toMaterialStyle('75%', 200).backgroundColor,
        },
        {
          type: 'line' as const,
          label: 'Rolling average MTTR at 75%',
          borderWidth: 2,
          data: monthsMovingAverage.map(
            (m: any) => m.stats.rolling.monthsToRelease.quantiles[75].value,
          ),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgb(255, 99, 132)',
        },
      ],
    };

    return (
      <>
        <Paper>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Typography variant="h6" component="h6">
                Mean time to release (MTTR), per month (quantiles)
              </Typography>
              <MttrTable months={monthsMovingAverage} jiraHost={jiraHost} />
              <Typography component="p">
                This table shows the average time to release (expressed in
                months) per months. Click on a datapoint to see the
                corresponding issues.
                <br />
                Legend for quantiles: Months (Issues in that quantile).
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" component="h6">
                MTTR, 75% quantile
              </Typography>
              <SimpleChart data={quantileChartData} />
              <Typography component="p">
                This chart displays the 75% quantile in months, both per month
                (bar) and using a {rollingWindow} months rolling window (line).{' '}
                <br />
                For example, a value of 4 for January 2022, means that 75% of
                the issues were released in 4 months or less. Note that empty
                months are not included in the calculation.
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" component="h6">
                MTTR Distribution
              </Typography>
              <BoxChart data={boxChartData} />
              <Typography component="p">
                This box plot displays the distribution of released issues for
                each month.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </>
    );
  }
  return null;
};

export default TimeToRelease;
