import React, { FC, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Paper from '@material-ui/core/Paper';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { connect } from 'react-redux';

import { iRootState } from '../../../../store';

import HistoryCompletionChart from '../../../../components/Charts/ChartJS/HistoryCompletionChart';
import HistoryForecastChart from '../../../../components/Charts/ChartJS/HistoryForecastChart';
import HistoryFocusChart from '../../../../components/Charts/ChartJS/HistoryFocusChart';

const mapState = (state: iRootState) => ({
  roadmap: state.roadmap.roadmap,
  initiativeHistory: state.roadmap.initiativeHistory,
  initiativeHistoryKey: state.roadmap.initiativeHistoryKey,
  defaultPoints: state.global.defaultPoints,
});

const mapDispatch = (dispatch: any) => ({
  initHistory: dispatch.roadmap.initHistory,
});

type connectedProps = ReturnType<typeof mapState | any> &
  ReturnType<typeof mapDispatch>;

const Charts: FC<connectedProps> = ({
  initiativeHistoryKey,
  initiativeHistory,
  defaultPoints,
  roadmap,
}) => {
  if (initiativeHistory === false) {
    return null;
  }
  let metric = 'Story Points';
  if (!defaultPoints) {
    metric = 'Issues Count';
  }
  return (
    <React.Fragment>
      <Grid container spacing={3} direction="column">
        <Grid item xs={12}>
          <Paper>
            <Typography variant="subtitle1">
              Evolution of the initiative complexity ({metric})
            </Typography>
            <HistoryCompletionChart
              dataset={initiativeHistory}
              defaultPoints={defaultPoints}
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper>
            <Typography variant="subtitle1">
              Evolution of the team focus (%) on the initiative ({metric})
            </Typography>
            <HistoryFocusChart
              dataset={initiativeHistory}
              defaultPoints={defaultPoints}
              jiraHost={roadmap.host}
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper>
            <Typography variant="subtitle1">
              Evolution of the naive forecast({metric})
            </Typography>
            {/* <HistoryForecastChart
              dataset={initiativeHistory}
              defaultPoints={defaultPoints}
            /> */}
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default connect(
  mapState,
  mapDispatch,
)(Charts);
