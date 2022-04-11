import React, { FC, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Grid from '@mui/material/Grid';

import Layout from '../../layout';
import Velocity from './velocity';
import Roadmap from './roadmap';
// import TeamsTabs from './teamtabs';

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

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Teams: FC<any> = ({
  setPageTitle,
  initView,
  match,
  history,
  selectedTeam,
  setShowMenu,
  loggedIn,
  teams,
  selectedTeamId,
}) => {
  setPageTitle(selectedTeam);
  useEffect(() => {
    setShowMenu(false);
    if (
      (selectedTeamId === null || selectedTeamId !== match.params.teamId) &&
      (loggedIn === true || JSON.parse(window._env_.AUTH0_DISABLED) === true)
    ) {
      initView({ selectedTeamId: match.params.teamId, tab: match.params.tab });
    }
    // if (match.params.team === undefined && selectedTeam !== null) {
    //   changeTab(selectedTeam);
    // }
  });

  // Receive request to change tab, update URL accordingly
  const changeTab = (newTab: string) => {
    history.push({
      pathname: '/teams/' + newTab,
    });
  };

  return (
    <Layout>
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
          <Velocity />
        </Grid>
        <Grid item>
          <Roadmap />
        </Grid>
        {/* <TeamsTabs changeTab={changeTab} />
      <DataStatus />
      <br />
      <Dashboard /> */}
      </Grid>
    </Layout>
  );
};
//       <Dashboard />

export default connect(mapState, mapDispatch)(withRouter(Teams));
