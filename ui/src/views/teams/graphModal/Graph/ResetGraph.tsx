import React, { FC } from 'react';
import clsx from 'clsx';
import { connect } from 'react-redux';

import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

import { iRootState } from '../../../../store';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1),
    },
    leftIcon: {
      marginRight: theme.spacing(1),
    },
    iconSmall: {
      fontSize: 20,
    },
  }),
);

const mapState = (state: iRootState) => ({
  graphNode: state.initiatives.graphNode,
  graphInitiative: state.initiatives.graphInitiative,
});

const mapDispatch = (dispatch: any) => ({
  setOpenGraph: dispatch.initiatives.setOpenGraph,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const ResetGraph: FC<connectedProps> = ({ graphNode }) => {
  const classes = useStyles();

  const resetView = () => {
    graphNode.fit();
  };

  return (
    <Button
      variant="contained"
      size="small"
      color="primary"
      className={classes.button}
      onClick={resetView}
    >
      <FullscreenIcon className={clsx(classes.leftIcon, classes.iconSmall)} />
      Reset View
    </Button>
  );
};

export default connect(mapState, mapDispatch)(ResetGraph);
