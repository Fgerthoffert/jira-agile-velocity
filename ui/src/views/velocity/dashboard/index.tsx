import React, { FC } from "react";
import { connect } from "react-redux";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Grid, { GridSpacing } from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import { iRootState } from "../../../store";

import WeeklyChart from "./WeeklyChart";
import DailyChart from "./DailyChart";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3, 2)
    }
  })
);

const mapState = (state: iRootState) => ({
  defaultPoints: state.global.defaultPoints,
  teams: state.velocity.teams,
  selectedTeam: state.velocity.selectedTeam
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Dashboard: FC<connectedProps> = ({
  defaultPoints,
  teams,
  selectedTeam
}) => {
  const classes = useStyles();
  let metric = "points";
  if (!defaultPoints) {
    metric = "issues";
  }
  const useTeam: any = teams.find((t: any) => t.team === selectedTeam);
  if (useTeam !== undefined) {
    console.log(useTeam);
    return (
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <Paper>
            <Typography variant="h5" component="h3">
              Open Points
            </Typography>
            <Typography component="p">
              {useTeam.velocity.forecast.completion[metric].openCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper>
            <Typography variant="h5" component="h3">
              Current Velocity
            </Typography>
            <Typography component="p">
              {useTeam.velocity.forecast.completion[metric].velocity}/week
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper>
            <Typography variant="h5" component="h3">
              Days to Completion
            </Typography>
            <Typography component="p">
              {useTeam.velocity.forecast.completion[metric].effortDays}
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
  mapDispatch
)(Dashboard);
