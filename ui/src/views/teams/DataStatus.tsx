import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Grid from '@mui/material/Grid';
import format from 'date-fns/format';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';

import { RootState, Dispatch } from '../../store';

const DataStatus = () => {
  const dispatch = useDispatch<Dispatch>();
  const fetchTeamData = dispatch.teams.fetchTeamData;
  const setShowDeleteModal = dispatch.teams.setShowDeleteModal;
  const deleteModalRefreshCacheDays =
    dispatch.teams.deleteModalRefreshCacheDays;
  const selectedTeamId = useSelector(
    (state: RootState) => state.teams.selectedTeamId,
  );
  const updatedAt = useSelector((state: RootState) => state.teams.updatedAt);

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
          <span>
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

export default DataStatus;
