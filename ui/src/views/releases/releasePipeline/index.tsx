import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';

import { format } from 'date-fns';
import randomColor from 'randomcolor';
import { median, mean, min, max, quantile } from 'simple-statistics';

import { RootState, Dispatch } from '../../../store';

const ReleasePipeline = () => {
  const defaultPoints = useSelector(
    (state: RootState) => state.global.defaultPoints,
  );
  const versions = useSelector((state: RootState) => state.versions.versions);
  const jiraHost = useSelector((state: RootState) => state.versions.jiraHost);

  const dispatch = useDispatch<Dispatch>();
  const setShowIssuesModal = dispatch.versions.setShowIssuesModal;
  const setIssuesModalIssues = dispatch.versions.setIssuesModalIssues;
  const setIssuesModalTitle = dispatch.versions.setIssuesModalTitle;

  const HeaderColumn = styled('div')(({ theme }) => ({
    textAlign: 'center',
  }));

  const filterMttrIssues = (issues: Array<any>) => {
    return issues
      .filter(
        (i: any) =>
          i.daysToReleaseIfToday >= 0 && i.monthsToReleaseIfToday !== undefined,
      )
      .map((i: any) => i.monthsToReleaseIfToday);
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
        width: 250,
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
        field: 'progress',
        headerName: 'Progress',
        width: 100,
        valueGetter: (params: GridValueGetterParams) => {
          const totalIssues = params.row.issues.length;
          const completedIssues = params.row.issues.filter(
            (i: any) =>
              i.resolutiondate !== undefined && i.resolutiondate !== null,
          ).length;

          return `${Math.round(
            (completedIssues * 100) / totalIssues,
          )}% (${completedIssues}/${totalIssues}) `;
        },
      },
      {
        field: 'issuesTotal',
        headerName: 'Issues #',
        width: 80,
        valueGetter: (params: GridValueGetterParams) =>
          params.row.issues.length,
        renderCell: (params) => {
          const filteredIssues: any = params.row.issues;
          return (
            <>
              {filteredIssues.length}
              <IconButton
                aria-label="delete"
                size="small"
                onClick={() => {
                  setShowIssuesModal(true);
                  setIssuesModalIssues(
                    filteredIssues.map((i: any) => {
                      return { ...i, release: params.row };
                    }),
                  );
                  setIssuesModalTitle(
                    `${filteredIssues.length} for release: ${params.row.name}`,
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
        field: 'issuesCompleted',
        headerName: 'Issues #',
        width: 80,
        valueGetter: (params: GridValueGetterParams) =>
          params.row.issues.filter(
            (i: any) =>
              i.resolutiondate !== undefined && i.resolutiondate !== null,
          ).length,
        renderCell: (params) => {
          const filteredIssues: any = params.row.issues.filter(
            (i: any) =>
              i.resolutiondate !== undefined && i.resolutiondate !== null,
          );
          return (
            <>
              {filteredIssues.length}
              <IconButton
                aria-label="delete"
                size="small"
                onClick={() => {
                  setShowIssuesModal(true);
                  setIssuesModalIssues(
                    filteredIssues.map((i: any) => {
                      return { ...i, release: params.row };
                    }),
                  );
                  setIssuesModalTitle(
                    `${filteredIssues.length} for release: ${params.row.name}`,
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
        field: 'pointsCompleted',
        headerName: 'Points',
        width: 60,
        valueGetter: (params: GridValueGetterParams) =>
          params.row.issues
            .filter(
              (i: any) =>
                i.resolutiondate !== undefined && i.resolutiondate !== null,
            )
            .map((i: any) => i.points)
            .reduce((acc: any, count: any) => acc + count, 0),
      },
      {
        field: 'issuesRemaining',
        headerName: 'Issues #',
        width: 80,
        valueGetter: (params: GridValueGetterParams) =>
          params.row.issues.filter(
            (i: any) =>
              i.resolutiondate === undefined || i.resolutiondate === null,
          ).length,
        renderCell: (params) => {
          // console.log(params.row.name);
          // console.log(params.row.issues);
          const filteredIssues = params.row.issues.filter(
            (i: any) =>
              i.resolutiondate === undefined || i.resolutiondate === null,
          );
          return (
            <>
              {filteredIssues.length}
              <IconButton
                aria-label="delete"
                size="small"
                onClick={() => {
                  setShowIssuesModal(true);
                  setIssuesModalIssues(
                    filteredIssues.map((i: any) => {
                      return { ...i, release: params.row };
                    }),
                  );
                  setIssuesModalTitle(
                    `${filteredIssues.length} for release: ${params.row.name}`,
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
        field: 'pointsRemaining',
        headerName: 'Points',
        width: 60,
        valueGetter: (params: GridValueGetterParams) =>
          params.row.issues
            .filter(
              (i: any) =>
                i.resolutiondate === undefined || i.resolutiondate === null,
            )
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
        groupId: 'Completed',
        description:
          'These issues are attached to the release and have a resolution date',
        children: [{ field: 'issuesCompleted' }, { field: 'pointsCompleted' }],
      },
      {
        groupId: 'Remaining',
        description:
          'These issues are attached to the release but do not have their resolution date set',
        children: [{ field: 'issuesRemaining' }, { field: 'pointsRemaining' }],
      },
      {
        groupId: 'mttr-today',
        headerName:
          'Mean time to release (if completed issues were to be released today)',
        description:
          'What would be the time to release metrics if the completed issues were to be released today',
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
          Release pipeline
        </Typography>

        <div
          style={{
            height: 800,
            width: '100%',
          }}
        >
          <DataGrid
            rows={versions
              .filter(
                (v: any) => v.issues.length > 0 && v.releaseDate === undefined,
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

export default ReleasePipeline;
