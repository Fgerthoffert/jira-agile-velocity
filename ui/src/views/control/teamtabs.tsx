import React, { FC } from 'react';
import { connect } from 'react-redux';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { iRootState } from '../../store';

const mapState = (state: iRootState) => ({
  teams: state.control.teams,
  selectedTeam: state.control.selectedTeam,
});

const mapDispatch = (dispatch: any) => ({
  updateSelectedTeam: dispatch.control.updateSelectedTeam,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;
const TeamsTabs: FC<any> = ({
  teams,
  changeTab,
  selectedTeam,
  updateSelectedTeam,
}) => {
  const handleChange = (event: React.ChangeEvent<{}>, teamId: string) => {
    changeTab(teamId);
    updateSelectedTeam(teamId);
  };
  if (teams.length === 0) {
    return null;
  }
  const selectedTeamValue = selectedTeam === null ? teams[0].id : selectedTeam;
  return (
    <Tabs
      value={selectedTeamValue}
      onChange={handleChange}
      indicatorColor="primary"
      textColor="primary"
      centered
    >
      {teams.map((team: any) => {
        return <Tab label={team.name} key={team.id} value={team.id} />;
      })}
    </Tabs>
  );
};

export default connect(
  mapState,
  mapDispatch,
)(TeamsTabs);
