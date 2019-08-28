import React, { FC } from "react";
import { connect } from "react-redux";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Grid, { GridSpacing } from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import { iRootState } from "../../../store";

import WeeklyChart from "./WeeklyChart";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3, 2)
    }
  })
);

const mapState = (state: iRootState) => ({
  defaultPoints: state.global.defaultPoints,
  teams: state.velocity.teams
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Teams: FC<connectedProps> = ({ defaultPoints, teams }) => {
  const classes = useStyles();
  let metric = "points";
  if (!defaultPoints) {
    metric = "issues count";
  }
  console.log(teams);
  if (teams.length > 0) {
    return (
      <Grid container className={classes.root} spacing={2}>
        {teams.map((team: any) => {
          return (
            <Grid item xs={12} key={team.team}>
              <Paper className={classes.root}>
                <Typography variant="h5" component="h3">
                  Team: {team.team}
                </Typography>
                <Typography component="p">
                  Calculated using weekly {metric}
                </Typography>
                <WeeklyChart
                  velocity={team.velocity}
                  defaultPoints={defaultPoints}
                />
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    );
  } else {
    return null;
  }
};

export default connect(
  mapState,
  mapDispatch
)(Teams);
