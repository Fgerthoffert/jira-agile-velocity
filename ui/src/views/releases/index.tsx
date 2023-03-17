import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { RootState, Dispatch } from '../../store';

import IssuesModal from './issuesModal';
import ReleaseScheduleChart from './releaseScheduleChart';
import ReleasePipeline from './releasePipeline';
import DataStatus from './DataStatus';
import Filters from './filters';
import DeliveredReleases from './deliveredReleased';
import MTTRDistributionChart from './MTTRDistributionChart';
import MTTRQuantileChart from './MTTRQuantileChart';
import MTTRQuantileTable from './MTTRQuantileTable';

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
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="stretch"
            spacing={3}
          >
            <Grid item xs={4}>
              <ReleaseScheduleChart />
            </Grid>
            <Grid item xs={4}>
              <MTTRQuantileChart />
            </Grid>
            <Grid item xs={4}>
              <MTTRDistributionChart />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <MTTRQuantileTable />
        </Grid>
        <Grid item>
          <DeliveredReleases />
        </Grid>
        <Grid item>
          <ReleasePipeline />
        </Grid>
      </Grid>
    </>
  );
};

export default Releases;
