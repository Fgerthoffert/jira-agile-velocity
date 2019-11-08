import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { FC } from 'react';
import Grid from '@material-ui/core/Grid';
import format from 'date-fns/format';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';

import { connect } from 'react-redux';

import { iRootState } from '../../store';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3, 2),
    },
    smallText: {
      fontSize: '0.8em',
    },
    updatedAt: {
      textAlign: 'left',
      fontSize: '0.8em',
      fontStyle: 'italic',
    },
  }),
);

const mapState = (state: iRootState) => ({
  roadmap: state.roadmap.roadmap,
});

const mapDispatch = (dispatch: any) => ({
  loadData: dispatch.roadmap.loadData,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const DataStatus: FC<connectedProps> = ({ roadmap, loadData }) => {
  const classes = useStyles();
  if (Object.values(roadmap).length > 0) {
    return (
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="center"
        spacing={1}
      >
        <Grid item>
          <span className={classes.updatedAt}>
            Last updated:{' '}
            {format(new Date(roadmap.updatedAt), 'E yyyy/MM/dd, hh:mm a')}
          </span>
        </Grid>
        <Grid item xs={12} sm container></Grid>
        <Grid item>
          <IconButton
            aria-label="delete"
            size="small"
            onClick={() => {
              loadData();
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Grid>
      </Grid>
    );
  } else {
    return null;
  }
};

export default connect(
  mapState,
  mapDispatch,
)(DataStatus);
