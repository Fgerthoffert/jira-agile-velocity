import React, { FC } from 'react';
import { connect } from 'react-redux';

import Layout from '../../layout';
import Dashboard from './dashboard';
import TeamsTabs from './teamtabs';

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
