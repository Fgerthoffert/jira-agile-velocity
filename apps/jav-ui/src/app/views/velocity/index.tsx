import React, { FC, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Layout from '../../layout';
import Dashboard from './dashboard';
import TeamsTabs from './teamtabs';
import LoadingBar from './LoadingBar';

import { iRootState } from '../../store';

const mapState = (state: iRootState) => ({
  selectedTeam: state.velocity.selectedTeam
});

const mapDispatch = (dispatch: any) => ({
  setPageTitle: dispatch.global.setPageTitle,
  initView: dispatch.velocity.initView
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Velocity: FC<any> = ({
  setPageTitle,
  initView,
  match,
  history,
  selectedTeam
}) => {
  setPageTitle('Velocity');

  useEffect(() => {
    if (selectedTeam === null) {
      initView(match.params.tab);
    }
    if (match.params.tab === undefined && selectedTeam !== null) {
      changeTab(selectedTeam);
    }
  });

  // Receive request to change tab, update URL accordingly
  const changeTab = (newTab: string) => {
    history.push({
      pathname: '/velocity/' + newTab
    });
  };

  return (
    <Layout>
      <LoadingBar />
      <TeamsTabs changeTab={changeTab} />
      <br />
      <Dashboard />
    </Layout>
  );
};
//       <Dashboard />

export default connect(
  mapState,
  mapDispatch
)(withRouter(Velocity));
