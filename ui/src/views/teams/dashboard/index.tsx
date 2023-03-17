import React from 'react';
import { useSelector } from 'react-redux';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import Completion from './completion';
import ResolutionsChart from './resolutionsChart';
import TimeToResolutionChart from './timeToResolutionChart';
import OpenVsClosedChart from './openVsClosedChart';

import { RootState } from '../../../store';

const Dashboard = () => {
  const jiraHost = useSelector((state: RootState) => state.teams.jiraHost);

  const completionStreams = useSelector(
    (state: RootState) => state.teams.completionStreams,
  );

  const forecastStreams = useSelector(
    (state: RootState) => state.teams.forecastStreams,
  );

  const resolutions = useSelector(
    (state: RootState) => state.teams.resolutions,
  );
  const positiveResolutions = resolutions.positive;
  const negativeResolutions = resolutions.negative;
  const ignoreResolutions = resolutions.ignore;

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        spacing={3}
      >
        <Grid item>
          <Completion completionStreams={completionStreams} />
        </Grid>
        <Grid item>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Paper>
                <Typography variant="h5" component="h3">
                  Resolutions per month
                </Typography>
                <Typography component="p">
                  Breakdown of completed issues by resolution
                </Typography>
                <ResolutionsChart
                  completionStreams={completionStreams}
                  positiveResolutions={positiveResolutions}
                  negativeResolutions={negativeResolutions}
                  ignoreResolutions={ignoreResolutions}
                  jiraHost={jiraHost}
                />
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper>
                <Typography variant="h5" component="h3">
                  Mean time to resolution
                </Typography>
                <Typography component="p">
                  In days, from issue creation
                </Typography>
                <TimeToResolutionChart
                  completionStreams={completionStreams}
                  positiveResolutions={positiveResolutions}
                  negativeResolutions={negativeResolutions}
                  ignoreResolutions={ignoreResolutions}
                  jiraHost={jiraHost}
                  rollingWindow={3}
                />
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper>
                <Typography variant="h5" component="h3">
                  Open Vs. Closed tickets
                </Typography>
                <Typography component="p">
                  Note: Backlog evolution limited to 12 months
                </Typography>
                <OpenVsClosedChart
                  completionStreams={completionStreams}
                  forecastStreams={forecastStreams}
                  jiraHost={jiraHost}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
