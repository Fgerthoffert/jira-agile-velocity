import React, { FC, useEffect } from 'react';
import { connect } from 'react-redux';

import Charts from './Charts';

const mapDispatch = (dispatch: any) => ({
  initHistory: dispatch.initiatives.initHistory,
});

type connectedProps = ReturnType<typeof mapDispatch | any>;

const History: FC<connectedProps> = ({ initiativeKey, initHistory }) => {
  useEffect(() => {
    initHistory(initiativeKey);
  });
  return null;
  //   return <Charts />;
};

export default connect(null, mapDispatch)(History);
