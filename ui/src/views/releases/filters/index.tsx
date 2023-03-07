import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import TextFilter from './textFilter';
import { RootState, Dispatch } from '../../../store';

const Filters = () => {
  const dispatch = useDispatch<Dispatch>();
  const setFilterName = dispatch.versions.setFilterName;
  const setFilterProjectKey = dispatch.versions.setFilterProjectKey;
  const setFilterLabel = dispatch.versions.setFilterLabel;
  const setFilterIssueType = dispatch.versions.setFilterIssueType;
  const setFilterPriority = dispatch.versions.setFilterPriority;
  const setMonthsToChart = dispatch.versions.setMonthsToChart;
  const refreshFilters = dispatch.versions.refreshFilters;

  const filterName = useSelector(
    (state: RootState) => state.versions.filterName,
  );
  const filterLabel = useSelector(
    (state: RootState) => state.versions.filterLabel,
  );
  const filterProjectKey = useSelector(
    (state: RootState) => state.versions.filterProjectKey,
  );
  const filterPriority = useSelector(
    (state: RootState) => state.versions.filterPriority,
  );
  const filterIssueType = useSelector(
    (state: RootState) => state.versions.filterIssueType,
  );
  const monthsToChart = useSelector(
    (state: RootState) => state.versions.monthsToChart,
  );

  const updateFilterName = (value: string) => {
    setFilterName(value);
    refreshFilters();
  };

  const updateFilterLabel = (value: string) => {
    setFilterLabel(value);
    refreshFilters();
  };

  const updateFilterProjectKey = (value: string) => {
    setFilterProjectKey(value);
    refreshFilters();
  };

  const updateFilterIssueType = (value: string) => {
    setFilterIssueType(value);
    refreshFilters();
  };

  const updateFilterPriority = (value: string) => {
    setFilterPriority(value);
    refreshFilters();
  };

  const updateMonthsToChart = (value: string) => {
    setMonthsToChart(value);
    refreshFilters();
  };

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      spacing={1}
    >
      <Grid item>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Filters
        </Typography>
      </Grid>
      <Grid item>
        <TextFilter
          filterId="name"
          filterLabel="Release Name"
          value={filterName}
          setValue={updateFilterName}
        />
      </Grid>
      <Grid item>
        <TextFilter
          filterId="type"
          filterLabel="Issue Type"
          value={filterIssueType}
          setValue={updateFilterIssueType}
        />
      </Grid>
      <Grid item>
        <TextFilter
          filterId="priority"
          filterLabel="Priority"
          value={filterPriority}
          setValue={updateFilterPriority}
        />
      </Grid>
      <Grid item>
        <TextFilter
          filterId="projectkey"
          filterLabel="Project Key"
          value={filterProjectKey}
          setValue={updateFilterProjectKey}
        />
      </Grid>
      <Grid item>
        <TextFilter
          filterId="label"
          filterLabel="Label"
          value={filterLabel}
          setValue={updateFilterLabel}
        />
      </Grid>
      <Grid item xs={12} sm container></Grid>
      <Grid item>
        <TextFilter
          filterId="months"
          filterLabel="Months to chart"
          value={monthsToChart}
          setValue={updateMonthsToChart}
        />
      </Grid>
    </Grid>
  );
};

export default Filters;
