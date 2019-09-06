import React, { FC } from 'react';
import { connect } from 'react-redux';

import Layout from '../../layout';
import Table from './Table';
import Chart from './Chart';
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
      <Chart />
      <Table />
    </Layout>
  );
};

export default connect(
  null,
  mapDispatch
)(Roadmap);
