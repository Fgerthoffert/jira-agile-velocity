import React, { FC } from "react";
import { connect } from "react-redux";

import Typography from "@material-ui/core/Typography";

import Layout from "../../layout";

const mapDispatch = (dispatch: any) => ({
  setPageTitle: dispatch.global.setPageTitle
});

type connectedProps = ReturnType<typeof mapDispatch>;

const Velocity: FC<connectedProps> = ({ setPageTitle }) => {
  setPageTitle("Velocity");
  return (
    <Layout>
      <Typography paragraph>This is the team velocity view.</Typography>
    </Layout>
  );
};

export default connect(
  null,
  mapDispatch
)(Velocity);
