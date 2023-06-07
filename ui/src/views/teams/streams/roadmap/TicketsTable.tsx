import React, { FC } from 'react';

import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { format, differenceInDays } from 'date-fns';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

const TicketsTable: FC<any> = ({ issues, jiraHost }) => {
  if (issues.length === 0) {
    return null;
  }
  console.log(issues);
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
            href={encodeURI(jiraHost + `/browse/${params.row.key}`)}
            rel="noopener noreferrer"
            target="_blank"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        );
      },
    },
    { field: 'key', headerName: 'Key', width: 100 },
    {
      field: 'assignee',
      headerName: 'Assignee',
      width: 120,
      valueGetter: (params: GridValueGetterParams) =>
        params.row.assignee === null ? 'n/a' : params.row.assignee.displayName,
    },
    { field: 'summary', headerName: 'Summary', width: 500 },
    {
      field: 'labels',
      headerName: 'Labels',
      width: 300,
      renderCell: (params) => {
        return (
          <Stack direction="row" spacing={1}>
            {params.value.map((label: string) => (
              <Chip key={label} label={label} size="small" />
            ))}
          </Stack>
        );
      },
    },
    {
      field: 'sprint',
      headerName: 'Open Sprint',
      width: 200,
      valueGetter: (params: GridValueGetterParams) => {
        const nonClosedSprints = params.row.sprint.filter(
          (s: any) => s.state !== undefined && s.state !== 'CLOSED',
        );
        if (nonClosedSprints.length === 0) {
          return 'n/a';
        } else {
          return nonClosedSprints[0].name;
        }
      },
    },
    {
      field: 'fixVersions',
      headerName: 'Fix Versions',
      width: 250,
      renderCell: (params) => {
        return (
          <Stack direction="column" spacing={0} style={{ textAlign: 'left' }}>
            {params.value.map((label: string) => (
              <span key={label}>{label}</span>
            ))}
          </Stack>
        );
      },
    },
    {
      field: 'created',
      headerName: 'Created',
      width: 120,
      valueGetter: (params: GridValueGetterParams) =>
        format(new Date(params.row.created), 'yyyy-MM-dd'),
    },
    {
      field: 'time',
      headerName: 'Opened for (days)',
      width: 150,
      valueGetter: (params: GridValueGetterParams) =>
        differenceInDays(new Date(), new Date(params.row.created)),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 120,
      valueGetter: (params: GridValueGetterParams) =>
        params.row.priority === undefined ? 'n/a' : params.row.priority,
    },
    {
      field: 'points',
      headerName: 'Points',
      width: 120,
      valueGetter: (params: GridValueGetterParams) =>
        params.row.points > 0 ? params.row.points : '',
    },
    {
      field: 'state',
      headerName: 'State',
      width: 120,
      valueGetter: (params: GridValueGetterParams) => params.row.status.name,
    },
  ];
  return (
    <div style={{ height: 800, width: '100%' }}>
      <DataGrid
        rows={issues}
        columns={columns}
        pageSize={50}
        rowsPerPageOptions={[10, 50, 100, 500]}
      />
    </div>
  );
};

export default TicketsTable;
