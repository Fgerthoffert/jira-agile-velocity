import React from 'react';
import { useSelector } from 'react-redux';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { RootState } from '../../../../store';
import RoadmapChart from './RoadmapChart';
import RoadmapChartR from './RoadmapChartR';

import { sub } from 'date-fns';

export const getId = (inputstring: string) => {
  return String(inputstring)
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};

const formatCompletedStreams = (
  streams: any,
  metric: string,
  windowMonths: number,
  jiraHost: string,
) => {
  return streams
    .reduce((acc: Array<any>, stream: any) => {
      if (stream.issues.length > 0) {
        for (const i of stream.issues) {
          const completedIssues = i.weeks
            .map((w: any) => w.metrics.issues.count)
            .reduce((acc: number, value: number) => acc + value, 0);
          if (completedIssues > 0) {
            acc.push({
              key: `${stream.key}-${i.key}`,
              name: `${stream.name}: ${i.summary}`,
              link: `${jiraHost}/browse/${i.key}`,
              weeks: i.weeks,
              total: Math.round(
                i.weeks
                  .map((w: any) => w.metrics[metric].count)
                  .reduce((acc: any, count: any) => acc + count, 0),
              ),
            });
          }
        }
      } else {
        acc.push({
          ...stream,
          link: null,
          total: Math.round(
            stream.weeks
              .map((w: any) => w.metrics[metric].count)
              .reduce((acc: any, count: any) => acc + count, 0),
          ),
        });
      }
      return acc;
    }, [])
    .map((s: any) => {
      return {
        ...s,
        weeks: s.weeks.filter(
          (w: any) => w.firstDay > sub(new Date(), { months: windowMonths }),
        ),
      };
    })
    .filter((s: any) => s.total > 0);
};

const CompletionDetails = () => {
  const defaultPoints = useSelector(
    (state: RootState) => state.global.defaultPoints,
  );
  const completionStreams = useSelector(
    (state: RootState) => state.teams.completionStreams,
  );
  const jiraHost = useSelector((state: RootState) => state.teams.jiraHost);
  const completionWindowMonths = useSelector(
    (state: RootState) => state.teams.completionWindowMonths,
  );

  if (completionStreams.length === 0) {
    return null;
  }
  const metric = !defaultPoints ? 'issues' : 'points';

  const currentStreams = formatCompletedStreams(
    completionStreams,
    metric,
    completionWindowMonths,
    jiraHost,
  );

  return (
    <Paper>
      <Typography variant="h5" component="h3">
        Completion Details
      </Typography>
      <Typography component="p">
        Number of {metric} completed each week over the past{' '}
        {completionWindowMonths} months
      </Typography>
      <Typography component="p" variant="subtitle2">
        === TEMPORARY VIEW ===
      </Typography>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={1}
      >
        <Grid item xs={12}>
          <RoadmapChart
            streams={currentStreams}
            metric={metric}
            jiraHost={jiraHost}
          />
        </Grid>
        {/* <Grid item xs={12}>
          <RoadmapChartR streams={currentStreams} metric={metric} />
        </Grid> */}
      </Grid>
    </Paper>
  );
};

export default CompletionDetails;
