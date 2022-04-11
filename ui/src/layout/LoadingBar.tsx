import React, { FC } from 'react';
import { Theme } from '@mui/material/styles';

import { createStyles, makeStyles } from '@mui/styles';

import { connect } from 'react-redux';

import { iRootState } from '../store';
import LinearProgress from '@mui/material/LinearProgress';

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
  teamsLoading: state.teams.loading,
});

type connectedProps = ReturnType<typeof mapState> & any;
const LoadingBar: FC<connectedProps> = ({ globalLoading, teamsLoading }) => {
  const classes = useStyles();
  if (globalLoading || teamsLoading) {
    return (
      <React.Fragment>
        <LinearProgress color="secondary" className={classes.root} />
      </React.Fragment>
    );
  }
  return null;
};

export default connect(mapState, null)(LoadingBar);
