import MaterialTable from 'material-table';
import React, { FC } from 'react';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import IconButton from '@material-ui/core/IconButton';
import ProgressBar from 'react-bootstrap/ProgressBar';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { getProgress, getBarVariant, getEstimateState } from '../../utils';

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number,
) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

const Epics: FC<any> = ({ children, jiraHost }) => {
  const dedaultStyle = { padding: '4px 5px 4px 5px' };
  const dataset = children.map((child: any) => {
    return {
      key: child.key,
      title: child.summary,
      url: jiraHost + '/browse/' + child.key,
      team: child.assignee === null ? 'n/a' : child.assignee.name,
      state: child.status.name,
      progressPoints: getProgress(child, 'points'),
      progressIssues: getProgress(child, 'issues'),
      progressEstimate: getEstimateState(child),
    };
  });
  return (
    <React.Fragment>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Estimated</TableCell>
              <TableCell>Issues</TableCell>
              <TableCell>State</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataset.map((row: any) => (
              <TableRow key={row.key}>
                <TableCell component="th" scope="row">
                  <IconButton
                    aria-label="open-external"
                    size="small"
                    href={row.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                  {row.key}
                </TableCell>
                <TableCell component="th" scope="row">
                  {row.title}
                </TableCell>
                <TableCell component="th" scope="row">
                  {row.team}
                </TableCell>
                <TableCell>
                  <ProgressBar
                    variant={getBarVariant(row.progressPoints.progress, 0)}
                    now={row.progressPoints.progress}
                    label={
                      <span style={{ color: '#000' }}>
                        {row.progressPoints.progress}% (
                        {row.progressPoints.completed}/
                        {row.progressPoints.total})
                      </span>
                    }
                  />
                </TableCell>
                <TableCell>
                  <span style={{ color: '#000' }}>
                    {row.progressEstimate.progress}% (
                    {row.progressEstimate.esimtated}/
                    {row.progressEstimate.total})
                  </span>
                </TableCell>
                <TableCell>
                  <ProgressBar
                    variant={getBarVariant(row.progressIssues.progress, 0)}
                    now={row.progressIssues.progress}
                    label={
                      <span style={{ color: '#000' }}>
                        {row.progressIssues.progress}% (
                        {row.progressIssues.completed}/
                        {row.progressIssues.total})
                      </span>
                    }
                  />
                </TableCell>
                <TableCell component="th" scope="row">
                  {row.state}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
};

export default Epics;
