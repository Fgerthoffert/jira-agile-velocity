import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { RootState } from '../../../store';

import CompletionChart from './CompletionChart';
import VelocityChart from './VelocityChart';
import DistributionChart from './DistributionChart';

const Completion = () => {
  const defaultPoints = useSelector(
    (state: RootState) => state.global.defaultPoints,
  );
  const completionStreams = useSelector(
    (state: RootState) => state.teams.completionStreams,
  );
  const jiraHost = useSelector((state: RootState) => state.teams.jiraHost);

  const metric = !defaultPoints ? 'issues' : 'points';

  if (completionStreams.length > 0) {
    return (
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <Paper>
            <Typography variant="h5" component="h3">
              Weekly Completion
            </Typography>
            <Typography component="p">
              Number of {metric} completed each week
            </Typography>
            <CompletionChart
              completionStreams={completionStreams}
              jiraHost={jiraHost}
              metric={metric}
            />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper>
            <Typography variant="h5" component="h3">
              Weekly Velocity
            </Typography>
            <Typography component="p">
              Calculated using {metric}, and 4 weeks rolling average
            </Typography>
            <VelocityChart
              completionStreams={completionStreams}
              metric={metric}
            />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper>
            <Typography variant="h5" component="h3">
              Effort distribution
            </Typography>
            <Typography component="p">
              Calculated using {metric}, and 4 weeks rolling average
            </Typography>
            <DistributionChart
              completionStreams={completionStreams}
              jiraHost={jiraHost}
              metric={metric}
            />
          </Paper>
        </Grid>
      </Grid>
    );
  }
  return null;
};

export default Completion;
