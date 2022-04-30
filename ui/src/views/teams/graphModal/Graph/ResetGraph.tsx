import React, { FC } from 'react';
import clsx from 'clsx';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

import { RootState } from '../../../../store';

const mapState = (state: RootState) => ({
  graphNode: state.initiatives.graphNode,
  graphInitiative: state.initiatives.graphInitiative,
});

const mapDispatch = (dispatch: any) => ({
  setOpenGraph: dispatch.initiatives.setOpenGraph,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const ResetGraph: FC<connectedProps> = ({ graphNode }) => {
  const resetView = () => {
    graphNode.fit();
  };

  return (
    <Button
      variant="contained"
      size="small"
      color="primary"
      onClick={resetView}
    >
      <FullscreenIcon />
      Reset View
    </Button>
  );
};

export default connect(mapState, mapDispatch)(ResetGraph);
