import React from 'react';
import { useSelector } from 'react-redux';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { RootState } from '../../../store';
import RoadmapChart from './RoadmapChart';

export const getId = (inputstring: string) => {
  return String(inputstring)
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};

const formatStreams = (streams: any, metric: string) => {
  // console.log(streams);
  return streams.map((stream: any) => {
    return {
      ...stream,
      remaining: stream.metrics[metric].remaining,
      items:
        stream.fetchChild === false
          ? []
          : stream.issues
              .map((i: any) => {
                return {
                  name: i.summary,
                  remaining: i.metrics[metric].remaining,
                };
              })
              .filter((i: any) => i.remaining > 0),
    };
  });
};

const Forecast = () => {
  const defaultPoints = useSelector(
    (state: RootState) => state.global.defaultPoints,
  );
  const simulatedStreams = useSelector(
    (state: RootState) => state.teams.simulatedStreams,
  );

  if (simulatedStreams.length === 0) {
    return null;
  }
  const metric = !defaultPoints ? 'issues' : 'points';

  const currentStreams = formatStreams(simulatedStreams, metric);

  console.log(currentStreams);
  return (
    <Paper>
      <Typography variant="h5" component="h3">
        Naive Forecast
      </Typography>
      <Typography component="p">
        Remaining work calculated using {metric}
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <RoadmapChart streams={currentStreams} metric={metric} />
          <Typography component="p">
            <i>
              Displays remaining effort based on the provided JQL queries and
              current stream velocity.
            </i>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Forecast;
