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
  return (
    <MaterialTable
      columns={[
        {
          title: 'Key',
          field: 'key',
          cellStyle: { width: 200 }
        },
        {
          title: 'Title',
          field: 'title'
        },
        {
          title: 'Team',
          field: 'team',
          cellStyle: { width: 200 }
        },
        {
          title: 'Total',
          field: 'total',
          cellStyle: { width: 60 }
        },
        {
          title: 'Completed',
          field: 'completed',
          cellStyle: { width: 80 }
        },
        {
          title: 'Remaining',
          field: 'remaining',
          cellStyle: { width: 80 }
        },
        { title: 'State', field: 'state', cellStyle: { width: 80 } }
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
    />
  );
};

export default connect(
  mapState,
  mapDispatch
)(InitiativeTable);
