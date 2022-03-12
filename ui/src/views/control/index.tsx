import React, { FC, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Layout from '../../layout';
import Dashboard from './dashboard';
import TeamsTabs from './teamtabs';

import { iRootState } from '../../store';
import DataStatus from './DataStatus';

const mapState = (state: iRootState) => ({
  selectedTeam: state.control.selectedTeam,
  loggedIn: state.global.loggedIn,
});

const mapDispatch = (dispatch: any) => ({
  setPageTitle: dispatch.global.setPageTitle,
  initView: dispatch.control.initView,
  setShowMenu: dispatch.global.setShowMenu,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Control: FC<any> = ({
  setPageTitle,
  initView,
  match,
  history,
  selectedTeam,
  setShowMenu,
  loggedIn,
}) => {
  setPageTitle('Control Charts');
  useEffect(() => {
    setShowMenu(false);
    if (
      selectedTeam === null &&
      (loggedIn === true || JSON.parse(window._env_.AUTH0_DISABLED) === true)
    ) {
      initView(match.params.tab);
    }
    if (match.params.tab === undefined && selectedTeam !== null) {
      changeTab(selectedTeam);
    }
  });

  // Receive request to change tab, update URL accordingly
  const changeTab = (newTab: string) => {
    history.push({
      pathname: '/control/' + newTab,
    });
  };

  return (
    <Layout>
      <TeamsTabs changeTab={changeTab} />
      <DataStatus />
      <br />
      <Dashboard />
    </Layout>
  );
};
//       <Dashboard />

export default connect(
  mapState,
  mapDispatch,
)(withRouter(Control));
