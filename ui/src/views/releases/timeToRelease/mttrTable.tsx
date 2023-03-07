import React, { FC } from 'react';
import { useDispatch } from 'react-redux';

import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress';

// import ProgressBar from 'react-bootstrap/ProgressBar';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import randomColor from 'randomcolor';
import { format } from 'date-fns';
import { max, min, mean, quantile } from 'simple-statistics';

import { RootState, Dispatch } from '../../../store';

interface Props {
  months: Array<any>;
  jiraHost: string;
}

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

const MttrTable: FC<Props> = ({ months, jiraHost }) => {
  const dispatch = useDispatch<Dispatch>();
  const setShowIssuesModal = dispatch.versions.setShowIssuesModal;
  const setIssuesModalIssues = dispatch.versions.setIssuesModalIssues;
  const setIssuesModalTitle = dispatch.versions.setIssuesModalTitle;

  return (
    <Table size="small" aria-label="a dense table">
      <TableHead>
        <TableRow>
          <TableCell align="center" colSpan={3}></TableCell>
          <TableCell align="center" colSpan={7}>
            Quantiles
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ width: 150 }}>Month</TableCell>
          <TableCell style={{ width: 100 }}>Issues #</TableCell>
          <TableCell style={{ width: 100 }}>Points</TableCell>
          <TableCell style={{ width: 150 }}>Min</TableCell>
          <TableCell style={{ width: 150 }}>Max</TableCell>
          <TableCell style={{ width: 150 }}>25%</TableCell>
          <TableCell style={{ width: 150 }}>50%</TableCell>
          <TableCell style={{ width: 150 }}>75%</TableCell>
          <TableCell style={{ width: 150 }}>90%</TableCell>
          <TableCell style={{ width: 150 }}>95%</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {months.map((m: any) => {
          return (
            <TableRow
              key={m.monthStart}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{format(m.monthStart, 'LLL yyyy')}</TableCell>
              <TableCell>
                {m.issues.length}
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={() => {
                    setShowIssuesModal(true);
                    setIssuesModalIssues(m.issues);
                    setIssuesModalTitle(
                      `All issues released in ${format(
                        m.monthStart,
                        'MMMM yyyy',
                      )}`,
                    );
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell>
                {m.issues
                  .map((i: any) => i.points)
                  .reduce((acc: any, count: any) => acc + count, 0)}
              </TableCell>
              <TableCell>
                {m.stats.current.monthsToRelease.quantiles.min.value}
                {'('}
                {m.stats.current.monthsToRelease.quantiles.min.issues.length}
                {') '}
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={() => {
                    setShowIssuesModal(true);
                    setIssuesModalIssues(
                      m.stats.current.monthsToRelease.quantiles.min.issues,
                    );
                    setIssuesModalTitle(
                      `${
                        m.stats.current.monthsToRelease.quantiles.min.issues
                          .length
                      } issues released in ${format(
                        m.monthStart,
                        'MMMM yyyy',
                      )} with the fasted time to release of ${
                        m.stats.current.monthsToRelease.quantiles.min.value
                      } months`,
                    );
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell>
                {m.stats.current.monthsToRelease.quantiles.max.value}
                {'('}
                {m.stats.current.monthsToRelease.quantiles.max.issues.length}
                {') '}
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={() => {
                    setShowIssuesModal(true);
                    setIssuesModalIssues(
                      m.stats.current.monthsToRelease.quantiles.max.issues,
                    );
                    setIssuesModalTitle(
                      `${
                        m.stats.current.monthsToRelease.quantiles.max.issues
                          .length
                      } issues released in ${format(
                        m.monthStart,
                        'MMMM yyyy',
                      )} with the longest time to release of ${
                        m.stats.current.monthsToRelease.quantiles.max.value
                      } months`,
                    );
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell>
                {m.stats.current.monthsToRelease.quantiles[25].value}
                {' ('}
                {m.stats.current.monthsToRelease.quantiles[25].issues.length}
                {') '}
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={() => {
                    setShowIssuesModal(true);
                    setIssuesModalIssues(
                      m.stats.current.monthsToRelease.quantiles[25].issues,
                    );
                    setIssuesModalTitle(
                      `In ${format(
                        m.monthStart,
                        'MMMM yyyy',
                      )}, 25% of the issues (${
                        m.stats.current.monthsToRelease.quantiles[25].issues
                          .length
                      } / ${m.issues.length}) were released in  ${
                        m.stats.current.monthsToRelease.quantiles[25].value
                      } months or less`,
                    );
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell>
                {m.stats.current.monthsToRelease.quantiles[50].value}
                {' ('}
                {m.stats.current.monthsToRelease.quantiles[50].issues.length}
                {') '}
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={() => {
                    setShowIssuesModal(true);
                    setIssuesModalIssues(
                      m.stats.current.monthsToRelease.quantiles[50].issues,
                    );
                    setIssuesModalTitle(
                      `In ${format(
                        m.monthStart,
                        'MMMM yyyy',
                      )}, 50% of the issues (${
                        m.stats.current.monthsToRelease.quantiles[50].issues
                          .length
                      } / ${m.issues.length}) were released in  ${
                        m.stats.current.monthsToRelease.quantiles[50].value
                      } months or less`,
                    );
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell>
                {m.stats.current.monthsToRelease.quantiles[75].value}
                {' ('}
                {m.stats.current.monthsToRelease.quantiles[75].issues.length}
                {') '}
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={() => {
                    setShowIssuesModal(true);
                    setIssuesModalIssues(
                      m.stats.current.monthsToRelease.quantiles[75].issues,
                    );
                    setIssuesModalTitle(
                      `In ${format(
                        m.monthStart,
                        'MMMM yyyy',
                      )}, 75% of the issues (${
                        m.stats.current.monthsToRelease.quantiles[75].issues
                          .length
                      } / ${m.issues.length}) were released in  ${
                        m.stats.current.monthsToRelease.quantiles[75].value
                      } months or less`,
                    );
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell>
                {m.stats.current.monthsToRelease.quantiles[90].value}
                {' ('}
                {m.stats.current.monthsToRelease.quantiles[90].issues.length}
                {') '}
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={() => {
                    setShowIssuesModal(true);
                    setIssuesModalIssues(
                      m.stats.current.monthsToRelease.quantiles[90].issues,
                    );
                    setIssuesModalTitle(
                      `In ${format(
                        m.monthStart,
                        'MMMM yyyy',
                      )}, 90% of the issues (${
                        m.stats.current.monthsToRelease.quantiles[90].issues
                          .length
                      } / ${m.issues.length}) were released in  ${
                        m.stats.current.monthsToRelease.quantiles[90].value
                      } months or less`,
                    );
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell>
                {m.stats.current.monthsToRelease.quantiles[95].value}
                {' ('}
                {m.stats.current.monthsToRelease.quantiles[95].issues.length}
                {') '}
                <IconButton
                  aria-label="delete"
                  size="small"
                  onClick={() => {
                    setShowIssuesModal(true);
                    setIssuesModalIssues(
                      m.stats.current.monthsToRelease.quantiles[95].issues,
                    );
                    setIssuesModalTitle(
                      `In ${format(
                        m.monthStart,
                        'MMMM yyyy',
                      )}, 95% of the issues (${
                        m.stats.current.monthsToRelease.quantiles[95].issues
                          .length
                      } / ${m.issues.length}) were released in  ${
                        m.stats.current.monthsToRelease.quantiles[95].value
                      } months or less`,
                    );
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
export default MttrTable;
