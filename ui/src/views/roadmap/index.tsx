import React, { FC } from 'react';
import { connect } from 'react-redux';

import Layout from '../../layout';
import Details from './Details';
import Completion from './Completion';
import Forecast from './Forecast';
import Specs from './Specs';
import SectionTabs from './sectiontabs';
import LoadingBar from './LoadingBar';

const mapDispatch = (dispatch: any) => ({
  setPageTitle: dispatch.global.setPageTitle,
  initView: dispatch.roadmap.initView
});

type connectedProps = ReturnType<typeof mapDispatch>;

const Roadmap: FC<connectedProps> = ({ setPageTitle, initView }) => {
  setPageTitle('Initiatives');
  initView();
  return (
    <Layout>
      <LoadingBar />
      <SectionTabs />
      <br />
      <Completion />
      <Specs />
      <Forecast />
      <Details />
    </Layout>
  );
};

export default connect(
  null,
  mapDispatch
)(Roadmap);
