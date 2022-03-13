import React, { FC } from 'react';
import { connect } from 'react-redux';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { iRootState } from '../../../store';

import WeeklyChart from './WeeklyChart';

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
    chartStyle: {
      height: 500,
    }
  }),
);

const mapState = (state: iRootState) => ({
  defaultPoints: state.global.defaultPoints,
  velocity: state.assignees.velocity,
  teams: state.assignees.teams,
  selectedTeam: state.assignees.selectedTeam,
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints,
  fetchTeamData: dispatch.assignees.fetchTeamData,
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

  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }
  const useTeam: any = velocity.find((t: any) => t.id === selectedTeam);
  if (useTeam !== undefined) {
    return (
      <Grid container spacing={1}> 
        <Grid item xs={12}>
          <Paper >
            <Typography variant="h5" component="h3">
              Weekly rolling velocity over the past 16 weeks
            </Typography>
            <Typography component="p">
              Calculated using {metric}, and 4 weeks rolling average
            </Typography>
            <WeeklyChart
              assignees={useTeam.assignees}
              defaultPoints={defaultPoints}
              type="velocity"
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper >
            <Typography variant="h5" component="h3">
              Weekly closed count over the past 16 weeks
            </Typography>
            <Typography component="p">
              Calculated using {metric}
            </Typography>
            <WeeklyChart
              assignees={useTeam.assignees}
              defaultPoints={defaultPoints}
              type="count"
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
