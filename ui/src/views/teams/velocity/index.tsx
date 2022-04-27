import React, { FC } from 'react';
import { connect } from 'react-redux';
import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AddBoxIcon from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import IconButton from '@mui/material/IconButton';

import { iRootState } from '../../../store';

import { getId } from '../utils';

import VelocityChart from './VelocityChart';

const mapState = (state: iRootState) => ({
  defaultPoints: state.global.defaultPoints,
  completionStreams: state.teams.completionStreams,
  forecastData: state.teams.forecastData,
  forecastStreams: state.teams.forecastStreams,
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints,
  fetchTeamData: dispatch.teams.fetchTeamData,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Velocity: FC<connectedProps> = ({
  defaultPoints,
  completionStreams,
  forecastData,
  forecastStreams,
}) => {
  const metric = !defaultPoints ? 'issues' : 'points';

  if (completionStreams.length > 0) {
    return (
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Paper>
            <Typography variant="h5" component="h3">
              Weekly Velocity
            </Typography>
            <Typography component="p">
              Calculated using {metric}, and 4 weeks rolling average
            </Typography>
            <VelocityChart
              completionStreams={completionStreams}
              chartRange="weeks"
              metric={metric}
            />
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper>
            <Typography variant="h5" component="h3">
              Roadmap
            </Typography>
            <Typography component="p">
              Current and planned initiatives and other tickets
            </Typography>
            <Table size="small" aria-label="Roadmap">
              <TableHead>
                <TableRow>
                  <TableCell rowSpan={2}>Categories</TableCell>
                  <TableCell align="center" colSpan={2}>
                    Remaining
                  </TableCell>
                  <TableCell align="right" rowSpan={2}>
                    Effort
                  </TableCell>
                  <TableCell align="right" rowSpan={2}>
                    Velocity
                  </TableCell>
                  <TableCell align="right" rowSpan={2}>
                    Time to <br />
                    completion
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forecastStreams.map((s: any) => {
                  return (
                    <TableRow key={s.key}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell align="right">{s.remainingCount}</TableCell>
                      <TableCell align="right">{s.remaining}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label="open-external"
                          size="small"
                          onClick={() => {
                            console.log('+');
                            // setGraphInitiative(
                            //   issues.find((is: any) => is.key === i.key),
                            // );
                            // updateGraph();
                            // setOpenGraph(true);
                          }}
                        >
                          <IndeterminateCheckBoxIcon fontSize="small" />
                        </IconButton>
                        {s.effortPct}%
                        <IconButton
                          aria-label="open-external"
                          size="small"
                          onClick={() => {
                            console.log('+');
                            // setGraphInitiative(
                            //   issues.find((is: any) => is.key === i.key),
                            // );
                            // updateGraph();
                            // setOpenGraph(true);
                          }}
                        >
                          <AddBoxIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell align="right">{s.velocity} p/w</TableCell>
                      <TableCell align="right">
                        {s.timeToCompletion} w
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell align="right">TOTAL</TableCell>
                  <TableCell align="right">
                    {forecastStreams
                      .map((s: any) => s.remainingCount)
                      .reduce((acc: number, value: number) => acc + value, 0)}
                  </TableCell>
                  <TableCell align="right">
                    {forecastStreams
                      .map((s: any) => s.remaining)
                      .reduce((acc: number, value: number) => acc + value, 0)}
                  </TableCell>
                  <TableCell align="right">
                    {forecastStreams
                      .map((s: any) => s.effortPct)
                      .reduce((acc: number, value: number) => acc + value, 0)}
                    %
                  </TableCell>
                  <TableCell align="right">
                    {forecastStreams
                      .map((s: any) => s.velocity)
                      .reduce(
                        (acc: number, value: number) => acc + value,
                        0,
                      )}{' '}
                    p/w
                  </TableCell>
                  <TableCell align="right">
                    {Math.round(
                      (forecastStreams
                        .map((s: any) => s.remaining)
                        .reduce(
                          (acc: number, value: number) => acc + value,
                          0,
                        ) /
                        forecastStreams
                          .map((s: any) => s.velocity)
                          .reduce(
                            (acc: number, value: number) => acc + value,
                            0,
                          )) *
                        10,
                    ) / 10}{' '}
                    w
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Typography variant="subtitle2" component="div">
              A default point value is applied to non-estimated tickets, you can
              scroll to the tables below for more details.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  }
  return null;
};

export default connect(mapState, mapDispatch)(Velocity);
