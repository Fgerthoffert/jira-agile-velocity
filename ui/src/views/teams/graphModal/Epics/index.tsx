import React, { FC } from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';

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

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
  },
}));

interface Props {
  epics: Array<any>;
  jiraHost: string;
}

const Epics: FC<Props> = ({ epics, jiraHost }) => {
  const dedaultStyle = { padding: '4px 5px 4px 5px' };
  const dataset = epics.map((child: any) => {
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
                <TableCell>
                  <BorderLinearProgress
                    variant="determinate"
                    value={row.progressPoints.progress}
                  />
                  <span style={{ color: '#000' }}>
                    {row.progressPoints.progress}% (
                    {row.progressPoints.completed}/{row.progressPoints.total})
                  </span>
                </TableCell>
                <TableCell>
                  <span style={{ color: '#000' }}>
                    {row.progressEstimate.progress}% (
                    {row.progressEstimate.esimtated}/
                    {row.progressEstimate.total})
                  </span>
                </TableCell>
                <TableCell>
                  <BorderLinearProgress
                    variant="determinate"
                    value={row.progressIssues.progress}
                  />
                  <span style={{ color: '#000' }}>
                    {row.progressIssues.progress}% (
                    {row.progressIssues.completed}/{row.progressIssues.total})
                  </span>
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
