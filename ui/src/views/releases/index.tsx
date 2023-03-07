import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { RootState, Dispatch } from '../../store';

import IssuesModal from './issuesModal';
import Schedule from './schedule';
import TimeToRelease from './timeToRelease';
import ReleasePipeline from './releasePipeline';
import DataStatus from './DataStatus';
import Filters from './filters';
import DeliveredReleases from './deliveredReleased';

const Releases = () => {
  const dispatch = useDispatch<Dispatch>();
  const loggedIn = useSelector((state: RootState) => state.global.loggedIn);
  const setPageTitle = dispatch.global.setPageTitle;
  const initView = dispatch.versions.initView;
  const setShowMenu = dispatch.global.setShowMenu;

  useEffect(() => {
    setPageTitle(`Releases`);
    setShowMenu(false);
    if (loggedIn === true || JSON.parse(window._env_.AUTH0_DISABLED) === true) {
      initView();
    }
  });

  return (
    <>
      <IssuesModal />
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="stretch"
        spacing={3}
      >
        <Grid item>
          <DataStatus />
        </Grid>
        <Grid item>
          <Filters />
        </Grid>
        <Grid item>
          <TimeToRelease />
        </Grid>
        <Grid item>
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="stretch"
            spacing={3}
          >
            <Grid item xs={5}>
              <DeliveredReleases />
            </Grid>
            <Grid item xs={7}>
              <ReleasePipeline />
            </Grid>
          </Grid>
          <Typography variant="caption">
            Note: In most cases, data inconsistency is related to release dates
            missing in Jira (version marked as released, but without release
            date provided). Begin by fixing the inconsistencies in Jira.
          </Typography>
        </Grid>
        <Grid item>
          <Schedule />
        </Grid>
      </Grid>
    </>
  );
};

export default Releases;
