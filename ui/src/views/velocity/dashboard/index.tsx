import React, { FC, useEffect } from 'react';
import { connect } from 'react-redux';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { iRootState } from '../../../store';

import WeeklyChart from './WeeklyChart';
import DailyChart from './DailyChart';

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
  velocity: state.velocity.velocity,
  teams: state.velocity.teams,
  selectedTeam: state.velocity.selectedTeam,
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints,
  fetchTeamData: dispatch.velocity.fetchTeamData,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Dashboard: FC<connectedProps> = ({
  defaultPoints,
  teams,
  selectedTeam,
  velocity,
  fetchTeamData,
}) => {
  const classes = useStyles();

  const teamVelocity: any = velocity.find((t: any) => t.id === selectedTeam);
  useEffect(() => {
    // If team !== null but corresponding team 's data hasn't been loaded
    if (teamVelocity === undefined) {
      fetchTeamData(selectedTeam);
    }
  });

  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }
  const useTeam: any = velocity.find((t: any) => t.id === selectedTeam);
  if (useTeam !== undefined) {
    return (
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <Paper>
            <Typography variant="h5" component="h3">
              Open Points
            </Typography>
            <Typography variant="h6" component="h3">
              {useTeam.velocity.forecast.completion[metric].openCount}
            </Typography>
            <Typography component="p" className={classes.smallText}>
              <i>Sum of all {metric} across remaining issues.</i>
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper>
            <Typography variant="h5" component="h3">
              Current Velocity
            </Typography>
            <Typography variant="h6" component="h3">
              {useTeam.velocity.forecast.completion[metric].velocity}/week
            </Typography>
            <Typography component="p" className={classes.smallText}>
              Using rolling average
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper>
            <Typography variant="h5" component="h3">
              Days to Completion
            </Typography>
            <Typography variant="h6" component="h3">
              {useTeam.velocity.forecast.completion[metric].effortDays}
            </Typography>
            <Typography component="p" className={classes.smallText}>
              Estimate = Open / Current weekly velocity * 5 business days
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper>
            <Typography variant="h5" component="h3">
              Daily
            </Typography>
            <Typography component="p">
              Calculated using {metric}, and 20 days rolling average
            </Typography>
            <DailyChart
              velocity={useTeam.velocity}
              defaultPoints={defaultPoints}
            />
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper>
            <Typography variant="h5" component="h3">
              Weekly
            </Typography>
            <Typography component="p">
              Calculated using {metric}, and 4 weeks rolling average
            </Typography>
            <WeeklyChart
              velocity={useTeam.velocity}
              defaultPoints={defaultPoints}
            />
          </Paper>
        </Grid>
      </Grid>
    );
  }
  return null;
};

export default connect(
  mapState,
  mapDispatch,
)(Dashboard);
