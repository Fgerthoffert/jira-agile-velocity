import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch } from '@mui/material';

import { RootState, Dispatch } from '../../store';

const SwitchPoints = () => {
  const dispatch = useDispatch<Dispatch>();
  const defaultPoints = useSelector(
    (state: RootState) => state.global.defaultPoints,
  );

  const handleChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch.global.setDefaultPoints(event.target.checked);
  };
  return (
    <React.Fragment>
      Issues Count
      <Switch checked={defaultPoints} onChange={handleChange()} />
      Points
    </React.Fragment>
  );
};

export default SwitchPoints;
