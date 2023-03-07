import React from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { format } from 'date-fns';
import randomColor from 'randomcolor';
import { min, max, quantile } from 'simple-statistics';

import { RootState, Dispatch } from '../../../store';

const DeliveredReleases = () => {
  const defaultPoints = useSelector(
    (state: RootState) => state.global.defaultPoints,
  );
  const versions = useSelector((state: RootState) => state.versions.versions);
  const jiraHost = useSelector((state: RootState) => state.versions.jiraHost);

  const dispatch = useDispatch<Dispatch>();
  const setShowIssuesModal = dispatch.versions.setShowIssuesModal;
  const setIssuesModalIssues = dispatch.versions.setIssuesModalIssues;
  const setIssuesModalTitle = dispatch.versions.setIssuesModalTitle;

  const filterMttrIssues = (issues: Array<any>) => {
    return issues
      .filter(
        (i: any) => i.daysToRelease >= 0 && i.monthsToRelease !== undefined,
      )
      .map((i: any) => i.monthsToRelease);
  };

  if (versions.length > 0) {
    const columns: GridColDef[] = [
      {
        field: 'id',
        headerName: 'Jira',
        width: 50,
        renderCell: (params) => {
          return (
            <IconButton
              aria-label="open-external"
              size="small"
              href={encodeURI(
                jiraHost + `/issues/?jql=fixVersion="${params.row.name}"`,
              )}
              rel="noopener noreferrer"
              target="_blank"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          );
        },
      },
      { field: 'name', headerName: 'Name', width: 400 },
      {
        field: 'projects',
        headerName: 'Projects',
        width: 200,
        renderCell: (params) => {
          return (
            <Stack direction="row" spacing={1}>
              {params.row.projects.map((p: any) => {
                const color = randomColor({
                  luminosity: 'light',
                  format: 'rgb', // e.g. 'rgb(225,200,20)'
                  seed: p.projectKey,
                });
                return (
                  <Chip
                    label={p.projectKey}
                    icon={<OpenInNewIcon />}
                    size="small"
                    key={p.projectKey}
                    style={{ backgroundColor: color }}
                    component="a"
                    href={encodeURI(
                      jiraHost +
                        `/projects/${p.projectKey}?selectedItem=com.atlassian.jira.jira-projects-plugin:release-page&status=no-filter&contains=${params.row.name}`,
                    )}
                    rel="noopener noreferrer"
                    target="_blank"
                  />
                );
              })}
            </Stack>
          );
        },
      },
      {
        field: 'releaseDate',
        headerName: 'Release Date',
        width: 120,
        valueGetter: (params: GridValueGetterParams) =>
          format(new Date(params.row.releaseDate), 'yyyy-MM-dd'),
      },
      {
        field: 'issuesTotal',
        headerName: 'Issues #',
        width: 80,
        valueGetter: (params: GridValueGetterParams) =>
          params.row.issues.length,
        renderCell: (params) => {
          return (
            <>
              {params.row.issues.length}
              <IconButton
                aria-label="delete"
                size="small"
                onClick={() => {
                  setShowIssuesModal(true);
                  setIssuesModalIssues(
                    params.row.issues.map((i: any) => {
                      return { ...i, release: params.row };
                    }),
                  );
                  setIssuesModalTitle(
                    `${params.row.issues.length} for release: ${params.row.name}`,
                  );
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </>
          );
        },
      },
      {
        field: 'pointsTotal',
        headerName: 'Points',
        width: 60,
        valueGetter: (params: GridValueGetterParams) =>
          params.row.issues
            .map((i: any) => i.points)
            .reduce((acc: any, count: any) => acc + count, 0),
      },
      {
        field: 'min',
        headerName: 'Min',
        width: 70,
        valueGetter: (params: GridValueGetterParams) => {
          const issues = filterMttrIssues(params.row.issues);
          return issues.length === 0 ? 'N/A' : min(issues);
        },
      },
      {
        field: 'max',
        headerName: 'Max',
        width: 70,
        valueGetter: (params: GridValueGetterParams) => {
          const issues = filterMttrIssues(params.row.issues);
          return issues.length === 0 ? 'N/A' : max(issues);
        },
      },
      {
        field: '25',
        headerName: '25%',
        width: 70,
        valueGetter: (params: GridValueGetterParams) => {
          const issues = filterMttrIssues(params.row.issues);
          return issues.length === 0 ? 'N/A' : quantile(issues, 0.25);
        },
      },
      {
        field: '50',
        headerName: '50%',
        width: 70,
        valueGetter: (params: GridValueGetterParams) => {
          const issues = filterMttrIssues(params.row.issues);
          return issues.length === 0 ? 'N/A' : quantile(issues, 0.5);
        },
      },
      {
        field: '75',
        headerName: '75%',
        width: 70,
        valueGetter: (params: GridValueGetterParams) => {
          const issues = filterMttrIssues(params.row.issues);
          return issues.length === 0 ? 'N/A' : quantile(issues, 0.75);
        },
      },
      {
        field: '90',
        headerName: '90%',
        width: 70,
        valueGetter: (params: GridValueGetterParams) => {
          const issues = filterMttrIssues(params.row.issues);
          return issues.length === 0 ? 'N/A' : quantile(issues, 0.9);
        },
      },
      {
        field: '95',
        headerName: '95%',
        width: 70,
        valueGetter: (params: GridValueGetterParams) => {
          const issues = filterMttrIssues(params.row.issues);
          return issues.length === 0 ? 'N/A' : quantile(issues, 0.95);
        },
      },
    ];

    const columnGroupingModel = [
      {
        groupId: 'Total',
        children: [{ field: 'issuesTotal' }, { field: 'pointsTotal' }],
      },
      {
        groupId: 'mttr-today',
        headerName: 'Mean Time to release, in months ',
        children: [
          { field: 'min' },
          { field: 'max' },
          { field: '25' },
          { field: '50' },
          { field: '75' },
          { field: '90' },
          { field: '95' },
        ],
      },
    ];

    return (
      <Paper>
        <Typography variant="h5" component="h5">
          Completed releases
        </Typography>
        <div style={{ height: 800, width: '100%' }}>
          <DataGrid
            rows={versions
              .filter(
                (v: any) => v.issues.length > 0 && v.releaseDate !== undefined,
              )
              .map((v: any) => {
                return { ...v, id: v.name };
              })}
            columns={columns}
            experimentalFeatures={{ columnGrouping: true }}
            columnGroupingModel={columnGroupingModel}
            pageSize={50}
            rowsPerPageOptions={[10, 50, 100, 500]}
          />
        </div>
      </Paper>
    );
  }
  return null;
};

export default DeliveredReleases;
