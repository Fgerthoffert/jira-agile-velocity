import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Dispatch } from '../../../../store';

import Charts from './Charts';

const mapDispatch = (dispatch: any) => ({
  initHistory: dispatch.initiatives.initHistory,
});

type connectedProps = ReturnType<typeof mapDispatch | any>;

const History: FC<connectedProps> = ({ initiativeKey, initHistory }) => {
  const dispatch = useDispatch<Dispatch>();

  useEffect(() => {
    dispatch.initiatives.initHistory(initiativeKey);
  });
  return <Charts />;
};

export default History;
