import React, { FC } from 'react';
import clsx from 'clsx';

import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';

import { connect } from 'react-redux';

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

const RedrawGraph: FC<connectedProps> = ({ graphNode }) => {
  const redrawView = () => {
    const layout = graphNode.layout({
      name: 'cose-bilkent',
      animate: 'end',
      animationEasing: 'ease-out',
      animationDuration: 1000,
      randomize: true,
    });
    layout.run();
  };

  return (
    <Button
      variant="contained"
      size="small"
      color="primary"
      onClick={redrawView}
    >
      <RefreshIcon />
      Redraw
    </Button>
  );
};

export default connect(mapState, mapDispatch)(RedrawGraph);
