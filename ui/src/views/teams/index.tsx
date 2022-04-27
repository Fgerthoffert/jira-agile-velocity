import React, { FC, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Grid from '@mui/material/Grid';

import Layout from '../../layout';
import Completion from './completion';
import Forecast from './forecast';
import Roadmap from './roadmap';
import Review from './review';
import GraphModal from './graphModal';

import { iRootState } from '../../store';
import DataStatus from './DataStatus';

const mapState = (state: iRootState) => ({
  selectedTeam: state.teams.selectedTeam,
  selectedTeamId: state.teams.selectedTeamId,
  teams: state.global.selectedTeam,
  loggedIn: state.global.loggedIn,
});

const mapDispatch = (dispatch: any) => ({
  setPageTitle: dispatch.global.setPageTitle,
  initView: dispatch.teams.initView,
  setShowMenu: dispatch.global.setShowMenu,
});

const Teams: FC<any> = ({
  setPageTitle,
  initView,
  match,
  selectedTeam,
  setShowMenu,
  loggedIn,
  selectedTeamId,
}) => {
  setPageTitle(`Team metrics: ${match.params.teamId}`);
  useEffect(() => {
    setShowMenu(false);
    if (
      (selectedTeamId === null || selectedTeamId !== match.params.teamId) &&
      (loggedIn === true || JSON.parse(window._env_.AUTH0_DISABLED) === true)
    ) {
      initView({ selectedTeamId: match.params.teamId, tab: match.params.tab });
    }
  });

  return (
    <Layout>
      <GraphModal />
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
    </Layout>
  );
};

export default connect(mapState, mapDispatch)(withRouter(Teams));
