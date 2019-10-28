import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { FC } from 'react';
import RoadmapFutureChart from '../../../components/Charts/Nivo/RoadmapFutureChart';
import Typography from '@material-ui/core/Typography';
import InitiativeTable from './InitiativeTable';
import Grid from '@material-ui/core/Grid';
import format from 'date-fns/format';

import { connect } from 'react-redux';

import { iRootState } from '../../../store';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3, 2)
    },
    smallText: {
      fontSize: '0.8em'
    },
    updatedAt: {
      textAlign: 'left',
      fontSize: '0.8em',
      fontStyle: 'italic'
    }
  })
);

const mapState = (state: iRootState) => ({
  defaultPoints: state.global.defaultPoints,
  roadmap: state.roadmap.roadmap,
  selectedTab: state.roadmap.selectedTab
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints,
  setGraphInitiative: dispatch.roadmap.setGraphInitiative,
  updateGraph: dispatch.roadmap.updateGraph,
  setOpenGraph: dispatch.roadmap.setOpenGraph
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Forecast: FC<connectedProps> = ({
  defaultPoints,
  roadmap,
  selectedTab,
  setGraphInitiative,
  updateGraph,
  setOpenGraph
}) => {
  const classes = useStyles();
  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }

  if (Object.values(roadmap).length > 0 && selectedTab === 'futurechart') {
    return (
      <Grid
        container
        direction='column'
        justify='flex-start'
        alignItems='stretch'
        spacing={1}
      >
        <Grid item xs={12} className={classes.updatedAt}>
          <span>
            Last updated:{' '}
            {format(new Date(roadmap.updatedAt), 'E yyyy/MM/dd, hh:mm a')}
          </span>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.root}>
            <Typography variant='h5' component='h3'>
              Completion forecast
            </Typography>
            <RoadmapFutureChart
              roadmap={roadmap}
              defaultPoints={defaultPoints}
            />
            <br />
            <Typography component='p' className={classes.smallText}>
              <i>
                Displays initiatives assigned to a team, sorted as per the
                source JQL query. Uses the team's current weekly velocity and
                remaining effort in {metric} to build a timeline.
              </i>
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <InitiativeTable
            initiatives={roadmap.byFutureInitiative}
            jiraHost={roadmap.host}
            defaultPoints={defaultPoints}
            title={'Assigned to a team'}
            setGraphInitiative={setGraphInitiative}
            updateGraph={updateGraph}
            setOpenGraph={setOpenGraph}
          />
        </Grid>
        <Grid item xs={12}>
          <InitiativeTable
            initiatives={roadmap.byInitiative.filter(
              (i: any) => i.team === null && i.fields.status.name !== 'Done'
            )}
            jiraHost={roadmap.host}
            defaultPoints={defaultPoints}
            title={'Not assigned to a team'}
            setGraphInitiative={setGraphInitiative}
            updateGraph={updateGraph}
            setOpenGraph={setOpenGraph}
          />
        </Grid>
      </Grid>
    );
  } else {
    return null;
  }
};

export default connect(
  mapState,
  mapDispatch
)(Forecast);
