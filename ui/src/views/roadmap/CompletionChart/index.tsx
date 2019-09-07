import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { FC } from 'react';
import RoadmapCompletionChart from '../../../components/Charts/Nivo/RoadmapCompletionChart';
import Typography from '@material-ui/core/Typography';
import InitiativeTable from './InitiativeTable';
import Grid from '@material-ui/core/Grid';

import { connect } from 'react-redux';

import { iRootState } from '../../../store';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3, 2)
    },
    smallText: {
      fontSize: '0.8em'
    }
  })
);

const mapState = (state: iRootState) => ({
  defaultPoints: state.global.defaultPoints,
  roadmap: state.roadmap.roadmap,
  selectedTab: state.roadmap.selectedTab
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const CompletionChart: FC<connectedProps> = ({
  defaultPoints,
  roadmap,
  selectedTab
}) => {
  const classes = useStyles();
  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }

  if (Object.values(roadmap).length > 0 && selectedTab === 'completionchart') {
    return (
      <Grid
        container
        direction='column'
        justify='flex-start'
        alignItems='stretch'
        spacing={3}
      >
        <Grid item xs={12}>
          <Paper className={classes.root}>
            <Typography variant='h5' component='h3'>
              Current completion status
            </Typography>
            <RoadmapCompletionChart
              roadmap={roadmap}
              defaultPoints={defaultPoints}
            />
            <br />
            <Typography component='p' className={classes.smallText}>
              <i>Displays initiatives with completed {metric}.</i>
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <InitiativeTable
            initiatives={roadmap.byInitiative}
            defaultPoints={defaultPoints}
          />{' '}
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
)(CompletionChart);
