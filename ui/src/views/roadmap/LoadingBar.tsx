import React, { FC } from 'react';
import { connect } from 'react-redux';

import { iRootState } from '../../store';
import LinearProgress from '@material-ui/core/LinearProgress';

const mapState = (state: iRootState) => ({
  loading: state.roadmap.loading
});

type connectedProps = ReturnType<typeof mapState>;
const LoadingBar: FC<connectedProps> = ({ loading }) => {
  if (loading) {
    return <LinearProgress color='secondary' />;
  }
  return null;
};

export default connect(
  mapState,
  null
)(LoadingBar);
