import React, { FC } from "react";
import { connect } from "react-redux";

import Layout from "../../layout";
import Teams from "./teams/";

const mapDispatch = (dispatch: any) => ({
  setPageTitle: dispatch.global.setPageTitle,
  initView: dispatch.velocity.initView
});

type connectedProps = ReturnType<typeof mapDispatch>;

const Velocity: FC<connectedProps> = ({ setPageTitle, initView }) => {
  setPageTitle("Velocity");
  initView();
  return (
    <Layout>
      <Teams />
    </Layout>
  );
};

export default connect(
  null,
  mapDispatch
)(Velocity);
