import React, { FC, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { RootState, Dispatch } from '../../store';

const TeamTabs = () => {
  const dispatch = useDispatch<Dispatch>();
  const setSelectedTabId = dispatch.teams.setSelectedTabId;
  const selectedTabId = useSelector(
    (state: RootState) => state.teams.selectedTabId,
  );

  const completionStreams = useSelector(
    (state: RootState) => state.teams.completionStreams,
  );

  const initTabId = !selectedTabId ? 'dashboard' : selectedTabId;

  const [value, setValue] = React.useState(0);
  const [tabIdValue, setTabIdValue] = useState(initTabId);
  React.useEffect(() => {
    setTabIdValue(initTabId);
  }, [initTabId]);

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={tabIdValue}
        onChange={(event: React.SyntheticEvent, newValue: number) => {
          setSelectedTabId(newValue);
          setTabIdValue(newValue);
        }}
        aria-label="Switch between team tabs"
      >
        <Tab value="dashboard" label="Overall" />
        {completionStreams.map((s: any) => {
          return <Tab key={s.key} value={s.key} label={s.name} />;
        })}
        <Tab value="plan" label="Forecast" />
      </Tabs>
    </Box>
  );
};

export default TeamTabs;
