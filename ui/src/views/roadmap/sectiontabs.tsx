import React, { FC } from 'react';
import { connect } from 'react-redux';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { iRootState } from '../../store';

const mapState = (state: iRootState) => ({
  selectedTab: state.roadmap.selectedTab
});

const mapDispatch = (dispatch: any) => ({
  setSelectedTab: dispatch.roadmap.setSelectedTab
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;
const SectionTabs: FC<connectedProps> = ({ selectedTab, setSelectedTab }) => {
  function handleChange(event: React.ChangeEvent<{}>, newValue: number) {
    setSelectedTab(newValue);
  }
  return (
    <Tabs
      value={selectedTab}
      onChange={handleChange}
      indicatorColor='primary'
      textColor='primary'
      centered
    >
      <Tab label='Chart' key='chart' value='chart' />
      <Tab label='Table' key='table' value='table' />
    </Tabs>
  );
};

export default connect(
  mapState,
  mapDispatch
)(SectionTabs);
