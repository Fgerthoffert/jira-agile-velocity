import React, { FC } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import Paper from '@mui/material/Paper';

import { connect } from 'react-redux';

import { iRootState } from '../../../../store';

import HistoryEffort from './HistoryEffort';

const mapState = (state: iRootState) => ({
  initiativeHistory: state.initiatives.initiativeHistory,
  defaultPoints: state.global.defaultPoints,
});

const mapDispatch = (dispatch: any) => ({
  initHistory: dispatch.initiatives.initHistory,
});

type connectedProps = ReturnType<typeof mapState | any> &
  ReturnType<typeof mapDispatch>;

const Charts: FC<connectedProps> = ({ initiativeHistory, defaultPoints }) => {
  const metric = !defaultPoints ? 'issues' : 'points';

  if (initiativeHistory.length === 0) {
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

export default connect(mapState, mapDispatch)(Charts);
