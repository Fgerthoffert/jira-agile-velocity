import React, { FC } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import Layout from '../../layout';

import { iRootState } from '../../store';

const mapDispatch = (dispatch: any) => ({
  setAuthMessage: dispatch.global.setAuthMessage
});

const mapState = (state: iRootState) => ({
  loggedIn: state.global.loggedIn
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Default: FC<connectedProps> = ({ loggedIn }) => {
  if (loggedIn) {
    return <Redirect to='/velocity' />;
  }

  return (
    <Layout>
      <span>{''}</span>
    </Layout>
  );
};

export default connect(
  mapState,
  mapDispatch
)(Default);
