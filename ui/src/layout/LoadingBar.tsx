import React, { FC } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';

import { iRootState } from '../store';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      width: '100%',
    },
  }),
);

const mapState = (state: iRootState) => ({
  globalLoading: state.global.loading,
  velocityLoading: state.velocity.loading,
  roadmapLoading: state.roadmap.loading,
});

type connectedProps = ReturnType<typeof mapState> & any;
const LoadingBar: FC<connectedProps> = ({
  globalLoading,
  velocityLoading,
  roadmapLoading,
}) => {
  const classes = useStyles();
  if (globalLoading || velocityLoading || roadmapLoading) {
    return (
      <React.Fragment>
        <LinearProgress color="secondary" className={classes.root} />
      </React.Fragment>
    );
  }
  return null;
};

export default connect(
  mapState,
  null,
)(LoadingBar);
