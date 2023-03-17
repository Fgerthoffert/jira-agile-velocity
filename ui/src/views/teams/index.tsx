import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import GraphModal from './graphModal';
import DeleteModal from './deleteModal';

import { RootState, Dispatch } from '../../store';
import DataStatus from './DataStatus';
import TeamTabs from './TeamTabs';

import Dashboard from './dashboard';
import Plan from './plan';
import Streams from './streams';

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
  const selectedTabId = useSelector(
    (state: RootState) => state.teams.selectedTabId,
  );

  useEffect(() => {
    setPageTitle(`Team metrics: ${params.teamId}`);
    setShowMenu(false);
    if (
      (selectedTeamId === null || selectedTeamId !== params.teamId) &&
      (loggedIn === true || JSON.parse(window._env_.AUTH0_DISABLED) === true)
    ) {
      initView({
        selectedTeamId: params.teamId,
        tab: params.tab,
        selectedTabId: 'dashboard',
      });
    }
  });

  return (
    <>
      <GraphModal />
      <DeleteModal />
      <TeamTabs />
      <DataStatus />
      {selectedTabId === 'dashboard' && <Dashboard />}
      {selectedTabId === 'plan' && <Plan />}
      {selectedTabId !== 'dashboard' && selectedTabId !== 'plan' && (
        <Streams streamId={selectedTabId} />
      )}
    </>
  );
};

export default Teams;
