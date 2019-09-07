import MaterialTable from 'material-table';
import ProgressBar from 'react-bootstrap/ProgressBar';
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

const getProgress = (issue: any, metric: string) => {
  let progressPrct = 0;
  if (issue.metrics[metric].total > 0) {
    progressPrct =
      Math.round(
        ((issue.metrics[metric].completed * 100) /
          issue.metrics[metric].total) *
          10
      ) / 10;
  }
  return {
    completed: issue.metrics[metric].completed,
    total: issue.metrics[metric].total,
    progress: progressPrct
  };
};

const getMissingEffort = (issue: any) => {
  const missing =
    issue.metrics.points.missing > 0 ? issue.metrics.points.missing : '';
  return missing;
};

const getPayload = (issue: any, metric: string) => {
  return {
    type: issue.fields.issuetype.name,
    key: issue.key,
    title: issue.fields.summary,
    state: issue.fields.status.name,
    progress: getProgress(issue, metric),
    missingEffort: getMissingEffort(issue),
    missingPoints: issue.metrics.missingPoints,
    id: parseInt(issue.id, 10)
  };
};

const getBarVariant = (payload: any) => {
  if (payload.progress.progress === 100) {
    return 'success';
  } else if (payload.progress.progress === 100 && payload.missingEffort > 0) {
    return 'warning';
  }
  return undefined;
};

const flattenData = (initiatives: any, metric: string) => {
  const issues = [];
  for (const initiative of initiatives) {
    issues.push(getPayload(initiative, metric));
    if (initiative.children.length > 0) {
      for (const childl1 of initiative.children) {
        issues.push({
          ...getPayload(childl1, metric),
          parentId: parseInt(initiative.id, 10)
        });

        if (childl1.children.length > 0) {
          for (const childl2 of childl1.children) {
            issues.push({
              ...getPayload(childl2, metric),
              parentId: parseInt(childl1.id, 10)
            });
          }
        }
      }
    }
  }
  return issues;
};

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Table: FC<connectedProps> = ({ defaultPoints, roadmap, selectedTab }) => {
  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }
  if (Object.values(roadmap).length > 0 && selectedTab === 'table') {
    const issues: any = flattenData(roadmap.byInitiative, metric);
    return (
      <MaterialTable
        columns={[
          { title: 'Type', field: 'type', cellStyle: { width: 80 } },
          { title: 'Key', field: 'key', cellStyle: { width: 200 } },
          { title: 'Title', field: 'title' },
          { title: 'State', field: 'state', cellStyle: { width: 80 } },
          {
            title: 'Progress',
            field: 'progress',
            type: 'numeric',
            cellStyle: { width: 160 },
            render: rowData => {
              if (rowData.state === 'Done' && rowData.missingPoints === true) {
                return <span>n/a (missing but done)</span>;
              } else {
                return (
                  <ProgressBar
                    variant={getBarVariant(rowData)}
                    now={rowData.progress.progress}
                    label={
                      <span style={{ color: '#000' }}>
                        {rowData.progress.progress}% (
                        {rowData.progress.completed}/{rowData.progress.total})
                      </span>
                    }
                  />
                );
              }
            }
          },
          {
            title: '# Missing Estimates',
            field: 'missingEffort',
            type: 'numeric',
            cellStyle: { width: 120 }
          }
        ]}
        data={issues}
        parentChildData={(row: any, rows: any) =>
          rows.find((a: any) => a.id === row.parentId)
        }
        title={''}
      />
    );
  } else {
    return null;
  }
};

export default connect(
  mapState,
  mapDispatch
)(Table);
