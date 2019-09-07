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
          title: 'Velocity /week',
          field: 'velocity',
          cellStyle: { width: 80 }
        },
        {
          title: 'Remaining',
          field: 'remaining',
          cellStyle: { width: 60 }
        },
        { title: 'State', field: 'state', cellStyle: { width: 80 } }
      ]}
      data={initiatives.map((initiative: any) => {
        return {
          key: initiative.key,
          team: initiative.team.name,
          title: initiative.fields.summary,
          velocity: initiative.team.velocity[metric].current,
          remaining: initiative.metrics[metric].remaining,
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
