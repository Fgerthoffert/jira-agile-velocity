import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import Grid from '@mui/material/Grid';

import Completion from './completion';
import Forecast from './forecast';
import Roadmap from './roadmap';
import Review from './review';
import GraphModal from './graphModal';
import DeleteModal from './deleteModal';

import { RootState, Dispatch } from '../../store';
import DataStatus from './DataStatus';

const Teams = () => {
  const dispatch = useDispatch<Dispatch>();
  const selectedTeamId = useSelector(
    (state: RootState) => state.teams.selectedTeamId,
  );
  const loggedIn = useSelector((state: RootState) => state.global.loggedIn);
  const setPageTitle = dispatch.global.setPageTitle;
  const initView = dispatch.teams.initView;
  const setShowMenu = dispatch.global.setShowMenu;

  const params = useParams();

  useEffect(() => {
    setPageTitle(`Team metrics: ${params.teamId}`);
    setShowMenu(false);
    if (
      (selectedTeamId === null || selectedTeamId !== params.teamId) &&
      (loggedIn === true || JSON.parse(window._env_.AUTH0_DISABLED) === true)
    ) {
      initView({ selectedTeamId: params.teamId, tab: params.tab });
    }
  });

  return (
    <>
      <GraphModal />
      <DeleteModal />
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
          <Completion />
        </Grid>
        <Grid item>
          <Review />
        </Grid>
        <Grid item>
          <Forecast />
        </Grid>
        <Roadmap />
      </Grid>
    </>
  );
};

export default Teams;
