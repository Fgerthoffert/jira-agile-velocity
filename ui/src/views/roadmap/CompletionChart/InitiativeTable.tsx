import MaterialTable from 'material-table';
import React, { FC } from 'react';
import { connect } from 'react-redux';

import { iRootState } from '../../../store';

const mapState = (state: iRootState) => ({
  defaultPoints: state.global.defaultPoints,
  roadmap: state.roadmap.roadmap,
  selectedTab: state.roadmap.selectedTab
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints
});

const InitiativeTable: FC<any> = ({ defaultPoints, initiatives }) => {
  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }
  /*
actions={[
        {
          icon: 'link',
          tooltip: 'Open in Jira',
          onClick: (event, rowData: any) => alert('You saved ' + rowData.title)
        }
      ]}
  */
  const dedaultStyle = { padding: '4px 40px 4px 16px' };
  return (
    <MaterialTable
      columns={[
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
          title: 'Total',
          field: 'total',
          cellStyle: { ...dedaultStyle, width: 60 }
        },
        {
          title: 'Completed',
          field: 'completed',
          cellStyle: { ...dedaultStyle, width: 80 }
        },
        {
          title: 'Remaining',
          field: 'remaining',
          cellStyle: { ...dedaultStyle, width: 80 }
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
          title: initiative.fields.summary,
          team:
            initiative.fields.assignee === null
              ? 'n/a'
              : initiative.fields.assignee.name,
          completed: initiative.metrics[metric].completed,
          remaining: initiative.metrics[metric].remaining,
          total: initiative.metrics[metric].total,
          state: initiative.fields.status.name
        };
      })}
      title={''}
      options={{
        pageSize: 50,
        pageSizeOptions: [10, 20, 50, 100],
        emptyRowsWhenPaging: false
      }}
    />
  );
};

export default connect(
  mapState,
  mapDispatch
)(InitiativeTable);
