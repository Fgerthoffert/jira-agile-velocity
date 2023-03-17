import React from 'react';
import { useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { RootState } from '../../../store';

import MttrTable from './mttrTable';

const QuantileTable = () => {
  const jiraHost = useSelector((state: RootState) => state.versions.jiraHost);

  const monthsReleases = useSelector(
    (state: RootState) => state.versions.monthsReleases,
  );

  if (monthsReleases.length === 0) {
    return null;
  }

  return (
    <Paper>
      <Typography variant="h6" component="h6">
        Mean time to Release, per month (quantiles)
      </Typography>
      <MttrTable months={monthsReleases} jiraHost={jiraHost} />
      <Typography component="p">
        This table shows the average time to release (expressed in months) per
        months. Click on a datapoint to see the corresponding issues.
      </Typography>
    </Paper>
  );
};

export default QuantileTable;
