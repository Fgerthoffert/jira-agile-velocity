import React, { FC } from 'react';
import { connect } from 'react-redux';

import Layout from '../../layout';
import Details from './Details';
import Completion from './Completion';
import Forecast from './Forecast';
import SectionTabs from './sectiontabs';

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
      <SectionTabs />
      <br />
      <Completion />
      <Forecast />
      <Details />
    </Layout>
  );
};

export default connect(
  null,
  mapDispatch
)(Roadmap);
