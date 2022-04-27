import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import React, { FC } from 'react';
import Grid from '@mui/material/Grid';
import format from 'date-fns/format';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';

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
  selectedTeamId: state.teams.selectedTeamId,
  updatedAt: state.teams.updatedAt,
});

const mapDispatch = (dispatch: any) => ({
  fetchTeamData: dispatch.teams.fetchTeamData,
  setShowDeleteModal: dispatch.teams.setShowDeleteModal,
  deleteModalRefreshCacheDays: dispatch.teams.deleteModalRefreshCacheDays,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const DataStatus: FC<connectedProps> = ({
  selectedTeamId,
  fetchTeamData,
  updatedAt,
  setShowDeleteModal,
  deleteModalRefreshCacheDays,
}) => {
  const classes = useStyles();
  if (updatedAt !== null) {
    return (
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={1}
      >
        <Grid item>
          <span className={classes.updatedAt}>
            Last updated: {format(new Date(updatedAt), 'E yyyy/MM/dd, hh:mm a')}{' '}
          </span>
        </Grid>
        <Grid item xs={12} sm container></Grid>
        <Grid item>
          <IconButton
            aria-label="delete"
            size="small"
            onClick={() => {
              setShowDeleteModal(true);
              deleteModalRefreshCacheDays();
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton
            aria-label="refresh"
            size="small"
            onClick={() => {
              fetchTeamData(selectedTeamId);
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

export default connect(mapState, mapDispatch)(DataStatus);
