import React, { FC } from "react";
import { connect } from "react-redux";

import Layout from "../../layout";
import Table from "./Table";

const mapDispatch = (dispatch: any) => ({
  setPageTitle: dispatch.global.setPageTitle,
  initView: dispatch.roadmap.initView
});

type connectedProps = ReturnType<typeof mapDispatch>;

const Roadmap: FC<connectedProps> = ({ setPageTitle, initView }) => {
  setPageTitle("Roadmap");
  initView();
  return (
    <Layout>
      <Table />
    </Layout>
  );
};

export default connect(
  null,
  mapDispatch
)(Roadmap);
