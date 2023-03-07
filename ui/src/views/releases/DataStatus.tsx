import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Grid from '@mui/material/Grid';
import format from 'date-fns/format';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';

import { RootState, Dispatch } from '../../store';

const DataStatus = () => {
  const dispatch = useDispatch<Dispatch>();
  const fetchVersionData = dispatch.versions.fetchVersionData;
  const updatedAt = useSelector((state: RootState) => state.versions.updatedAt);

  if (updatedAt === null) {
    return null;
  }

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
          aria-label="refresh"
          size="small"
          onClick={() => {
            fetchVersionData();
          }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default DataStatus;
