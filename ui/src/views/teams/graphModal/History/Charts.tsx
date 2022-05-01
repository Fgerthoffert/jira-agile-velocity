import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import Paper from '@mui/material/Paper';

import { useSelector } from 'react-redux';

import { RootState } from '../../../../store';

import HistoryEffort from './HistoryEffort';

const Charts = () => {
  const initiativeHistory = useSelector(
    (state: RootState) => state.initiatives.initiativeHistory,
  );
  const defaultPoints = useSelector(
    (state: RootState) => state.global.defaultPoints,
  );
  const metric = !defaultPoints ? 'issues' : 'points';

  if (initiativeHistory.length === 0 || initiativeHistory === false) {
    return null;
  }

  const historyMetrics = initiativeHistory.sort(
    (a: any, b: any) =>
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  );

  return (
    <React.Fragment>
      <Grid container spacing={3} direction="column">
        <Grid item xs={12}>
          <Paper>
            <Typography variant="subtitle1">
              Evolution of the initiative complexity ({metric})
            </Typography>
            <HistoryEffort historyMetrics={historyMetrics} metric={metric} />
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default Charts;
