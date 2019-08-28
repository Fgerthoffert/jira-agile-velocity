import React, { FC } from "react";
import { connect } from "react-redux";

import Typography from "@material-ui/core/Typography";

import Layout from "../../layout";

const mapDispatch = (dispatch: any) => ({
  setPageTitle: dispatch.global.setPageTitle
});

type connectedProps = ReturnType<typeof mapDispatch>;

const Roadmap: FC<connectedProps> = ({ setPageTitle }) => {
  setPageTitle("Roadmap");
  return (
    <Layout>
      <Typography paragraph>This is the team roadmap view.</Typography>
    </Layout>
  );
};

export default connect(
  null,
  mapDispatch
)(Roadmap);
