import React, { FC } from "react";
import { connect } from "react-redux";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import { iRootState } from "../../store";

const mapState = (state: iRootState) => ({
  teams: state.velocity.teams,
  selectedTeam: state.velocity.selectedTeam
});

const mapDispatch = (dispatch: any) => ({
  setSelectedTeam: dispatch.velocity.setSelectedTeam
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;
const TeamsTabs: FC<connectedProps> = ({
  teams,
  selectedTeam,
  setSelectedTeam
}) => {
  function handleChange(event: React.ChangeEvent<{}>, newValue: number) {
    setSelectedTeam(newValue);
  }
  if (Object.values(teams).length === 0) {
    return null;
  }
  const selectedTeamValue =
    selectedTeam === null ? teams[0].team : selectedTeam;
  return (
    <Tabs
      value={selectedTeamValue}
      onChange={handleChange}
      indicatorColor="primary"
      textColor="primary"
      centered
    >
      {teams.map((team: any) => {
        return <Tab label={team.team} key={team.team} value={team.team} />;
      })}
    </Tabs>
  );
};

export default connect(
  mapState,
  mapDispatch
)(TeamsTabs);
