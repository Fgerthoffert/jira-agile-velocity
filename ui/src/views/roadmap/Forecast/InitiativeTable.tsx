import MaterialTable from 'material-table';
import React, { FC } from 'react';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import IconButton from '@material-ui/core/IconButton';
import ProgressBar from 'react-bootstrap/ProgressBar';

import { getProgress, getBarVariant } from '../utils';

const InitiativeTable: FC<any> = ({
  defaultPoints,
  initiatives,
  title,
  setGraphInitiative,
  updateGraph,
  setOpenGraph
}) => {
  const dedaultStyle = { padding: '4px 5px 4px 5px' };

  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }
  return (
    <MaterialTable
      columns={[
        {
          title: '',
          field: 'url',
          render: rowData => {
            return (
              <IconButton
                aria-label='open-external'
                size='small'
                href={rowData.url}
              >
                <OpenInNewIcon fontSize='small' />
              </IconButton>
            );
          },
          headerStyle: { ...dedaultStyle, width: 20 },
          cellStyle: { ...dedaultStyle, padding: '4px 5px 4px 5px', width: 20 }
        },
        {
          title: '',
          field: 'url',
          render: rowData => {
            return (
              <IconButton
                aria-label='open-external'
                size='small'
                onClick={() => {
                  setGraphInitiative(
                    initiatives.find((i: any) => i.key === rowData.key)
                  );
                  updateGraph();
                  setOpenGraph(true);
                }}
              >
                <BubbleChartIcon fontSize='small' />
              </IconButton>
            );
          },
          headerStyle: { ...dedaultStyle, width: 20 },
          cellStyle: { ...dedaultStyle, padding: '4px 0px 4px 0px', width: 20 }
        },
        {
          title: 'Key',
          field: 'key',
          cellStyle: { ...dedaultStyle, width: 200 }
        },
        {
          title: 'Title',
          field: 'title',
          cellStyle: { ...dedaultStyle }
        },
        {
          title: 'Team',
          field: 'team',
          cellStyle: { ...dedaultStyle, width: 200 }
        },
        {
          title: 'Velocity /week',
          field: 'velocity',
          type: 'numeric',
          headerStyle: { ...dedaultStyle, width: 60 },
          cellStyle: { ...dedaultStyle, width: 60 }
        },
        {
          title: 'Remaining',
          field: 'remaining',
          type: 'numeric',
          headerStyle: { ...dedaultStyle, width: 60 },
          cellStyle: { ...dedaultStyle, width: 60 }
        },
        {
          title: 'Points',
          field: 'progressPoints',
          headerStyle: { ...dedaultStyle, width: 160 },
          cellStyle: { ...dedaultStyle, width: 160 },
          render: rowData => {
            return (
              <ProgressBar
                variant={getBarVariant(rowData.progressPoints.progress, 0)}
                now={rowData.progressPoints.progress}
                label={
                  <span style={{ color: '#000' }}>
                    {rowData.progressPoints.progress}% (
                    {rowData.progressPoints.completed}/
                    {rowData.progressPoints.total})
                  </span>
                }
              />
            );
          }
        },
        {
          title: 'Issues Count',
          field: 'progressIssues',
          headerStyle: { ...dedaultStyle, width: 160 },
          cellStyle: { ...dedaultStyle, width: 160 },
          render: rowData => {
            return (
              <ProgressBar
                variant={getBarVariant(rowData.progressIssues.progress, 0)}
                now={rowData.progressIssues.progress}
                label={
                  <span style={{ color: '#000' }}>
                    {rowData.progressIssues.progress}% (
                    {rowData.progressIssues.completed}/
                    {rowData.progressIssues.total})
                  </span>
                }
              />
            );
          }
        },
        {
          title: 'State',
          field: 'state',
          cellStyle: { ...dedaultStyle, width: 80 }
        }
      ]}
      data={initiatives.map((initiative: any) => {
        return {
          key: initiative.key,
          team: initiative.team === null ? 'n/a' : initiative.team.name,
          title: initiative.fields.summary,
          url: initiative.host + '/browse/' + initiative.key,
          velocity:
            initiative.team === null
              ? 'n/a'
              : initiative.team.velocity[metric].current,
          remaining: initiative.metrics[metric].remaining,
          state: initiative.fields.status.name,
          progressPoints: getProgress(initiative, 'points'),
          progressIssues: getProgress(initiative, 'issues')
        };
      })}
      title={title}
      options={{
        pageSize: 50,
        pageSizeOptions: [10, 20, 50, 100],
        emptyRowsWhenPaging: false,
        search: false
      }}
    />
  );
};

export default InitiativeTable;
