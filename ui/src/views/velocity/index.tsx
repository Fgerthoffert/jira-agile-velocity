import React, { FC } from 'react';
import { connect } from 'react-redux';

import Layout from '../../layout';
import Dashboard from './dashboard';
import TeamsTabs from './teamtabs';
import LoadingBar from './LoadingBar';

const mapDispatch = (dispatch: any) => ({
  setPageTitle: dispatch.global.setPageTitle,
  initView: dispatch.velocity.initView
});

type connectedProps = ReturnType<typeof mapDispatch>;

const Velocity: FC<connectedProps> = ({ setPageTitle, initView }) => {
  setPageTitle('Velocity');
  initView();
  return (
    <Layout>
      <LoadingBar />
      <TeamsTabs />
      <br />
      <Dashboard />
    </Layout>
  );
};

export default connect(
  null,
  mapDispatch
)(Velocity);
