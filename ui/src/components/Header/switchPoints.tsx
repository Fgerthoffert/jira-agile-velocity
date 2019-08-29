import React, { FC } from "react";
import { connect } from "react-redux";
import clsx from "clsx";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

import { iRootState } from "../../store";

const mapState = (state: iRootState) => ({
  defaultPoints: state.global.defaultPoints
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const SwitchPoints: FC<connectedProps> = ({
  defaultPoints,
  setDefaultPoints
}) => {
  const handleChange = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultPoints(event.target.checked);
  };
  return (
    <React.Fragment>
      Issues Count
      <Switch checked={defaultPoints} onChange={handleChange()} />
      Points
    </React.Fragment>
  );
};

export default connect(
  mapState,
  mapDispatch
)(SwitchPoints);
