import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { startOfMonth, format } from 'date-fns';
import toMaterialStyle from 'material-color-hash';

import { RootState } from '../../../store';
import SimpleChart from './simpleChart';

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

const Schedule = () => {
  const defaultPoints = useSelector(
    (state: RootState) => state.global.defaultPoints,
  );
  const versions = useSelector((state: RootState) => state.versions.versions);
  const rollingWindow = useSelector(
    (state: RootState) => state.versions.rollingWindow,
  );
  const jiraHost = useSelector((state: RootState) => state.versions.jiraHost);

  // Look for the first and last month
  let startMonth = new Date();
  for (const v of versions) {
    if (new Date(v.releaseDate) < startMonth) {
      startMonth = startOfMonth(new Date(v.releaseDate));
    }
  }
  const months = getMonthsBetweenDates(startMonth, startOfMonth(new Date()));

  const monthsReleases = months.reduce((acc: Array<any>, m: Date) => {
    const releases = versions.filter(
      (v: any) =>
        m.getTime() === startOfMonth(new Date(v.releaseDate)).getTime(),
    );
    acc.push({
      monthStart: m,
      releases: releases,
      issues: releases
        .map((v: any) => v.issues.length)
        .reduce((acc: any, count: any) => acc + count, 0),
      points: releases
        .map((v: any) =>
          v.issues
            .map((i: any) => i.points)
            .reduce((acc: any, count: any) => acc + count, 0),
        )
        .reduce((acc: any, count: any) => acc + count, 0),
    });
    return acc;
  }, []);

  const monthsMovingAverage = monthsReleases.reduce(
    (acc: Array<any>, m: any, idx: number) => {
      const movingReleases: Array<any> = [];
      // Push issues for the current month
      for (let i = 0; i < rollingWindow; i++) {
        if (idx - i >= 0) {
          movingReleases.push(...monthsReleases[idx - i].releases);
        }
      }
      acc.push({
        ...m,
        movingReleases,
      });
      return acc;
    },
    [],
  );

  const labels = monthsReleases.map((m: any) =>
    format(m.monthStart, 'LLL yyyy'),
  );

  if (versions.length > 0) {
    return (
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <Paper>
            <Typography variant="h5" component="h5">
              Releases Schedule
            </Typography>
            <SimpleChart
              data={{
                labels,
                datasets: [
                  {
                    label: 'Number of releases',
                    data: monthsMovingAverage.map(
                      (m: any) => m.releases.length,
                    ),
                    backgroundColor: toMaterialStyle('Number of releases', 200)
                      .backgroundColor,
                    borderColor: toMaterialStyle('Number of releases', 200)
                      .backgroundColor,
                  },
                  {
                    type: 'line' as const,
                    label: `${rollingWindow} months rolling window`,
                    borderWidth: 2,
                    data: monthsMovingAverage.map((m: any) =>
                      Math.round(m.movingReleases.length / rollingWindow),
                    ),
                    borderColor: toMaterialStyle('3 months Rolling window', 200)
                      .backgroundColor,
                    backgroundColor: toMaterialStyle(
                      '3 months Rolling window',
                      200,
                    ).backgroundColor,
                  },
                ],
              }}
            />
            <Typography component="p">
              Number fo releases performed each month.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  }
  return null;
};

export default Schedule;
