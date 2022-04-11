import React, { FC } from 'react';
import { connect } from 'react-redux';
import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { iRootState } from '../../../store';

import VelocityChart from './VelocityChart';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3, 2),
    },
    smallText: {
      fontSize: '0.8em',
    },
    updatedAt: {
      textAlign: 'left',
      fontSize: '0.8em',
      fontStyle: 'italic',
    },
  }),
);

const mapState = (state: iRootState) => ({
  defaultPoints: state.global.defaultPoints,
  completionData: state.teams.completionData,
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints,
  fetchTeamData: dispatch.teams.fetchTeamData,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Vecocity: FC<connectedProps> = ({
  defaultPoints,
  completionData,
  fetchTeamData,
}) => {
  const classes = useStyles();

  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }
  if (completionData !== null) {
    return (
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Paper>
            <Typography variant="h5" component="h3">
              Daily Velocity
            </Typography>
            <Typography component="p">
              Calculated using {metric}, and 20 days rolling average
            </Typography>
            <VelocityChart
              completionData={completionData.completion}
              chartRange="days"
              metric={metric}
            />
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper>
            <Typography variant="h5" component="h3">
              Weekly Velocity
            </Typography>
            <Typography component="p">
              Calculated using {metric}, and 4 weeks rolling average
            </Typography>
            <VelocityChart
              completionData={completionData.completion}
              chartRange="weeks"
              metric={metric}
            />
          </Paper>
        </Grid>
      </Grid>
    );
  }
  return null;
};

export default connect(mapState, mapDispatch)(Vecocity);
