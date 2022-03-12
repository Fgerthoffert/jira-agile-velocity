import React, { FC } from 'react';
import { connect } from 'react-redux';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { iRootState } from '../../../store';

import ControlChart from './ControlChart';
import ControlChartRolling from './ControlChartRolling';

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
  velocity: state.control.velocity,
  teams: state.control.teams,
  selectedTeam: state.control.selectedTeam,
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints,
  fetchTeamData: dispatch.control.fetchTeamData,
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
        <Grid item xs={6}>
          <Paper>
            <Typography variant="h5" component="h3">
              Time to close in days
            </Typography>
            <Typography component="p">
              Current and 4 weeks rolling average
            </Typography>
            <ControlChartRolling
              control={useTeam.control}
            />
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper>
            <Typography variant="h5" component="h3">
              Time to close (by ticket count)
            </Typography>
            <Typography component="p">
              Number of business days tickets were opened for (less than)
            </Typography>
            <ControlChart
              control={useTeam.control}
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
