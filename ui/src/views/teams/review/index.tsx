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
import toMaterialStyle from 'material-color-hash';

import { format } from 'date-fns';

import { iRootState } from '../../../store';

import { getId } from '../utils';

import { CompletionStream } from '../../../global';

const mapState = (state: iRootState) => ({
  defaultPoints: state.global.defaultPoints,
  completionStreams: state.teams.completionStreams,
  forecastStreams: state.teams.streams,
  jiraHost: state.teams.jiraHost,
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints,
  fetchTeamData: dispatch.teams.fetchTeamData,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Review: FC<connectedProps> = ({
  defaultPoints,
  completionStreams,
  forecastStreams,
}) => {
  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }
  if (completionStreams.length > 0) {
    const lastStreamWeeks = completionStreams.map(
      (w: CompletionStream) => w.weeks.slice(-1)[0],
    );
    const totalStreamsVelocity = lastStreamWeeks
      .map((s: any) => s.metrics[metric].velocity)
      .reduce((acc: number, value: number) => acc + value, 0);

    return (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Paper>
            <Typography variant="h5" component="h3">
              Review and Plan
            </Typography>
            <Typography component="p">
              Current and planned initiatives and other tickets
            </Typography>
            <Table size="small" aria-label="Roadmap">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell
                    colSpan={3}
                    align="center"
                    style={{ backgroundColor: '#FBE9E7' }}
                  >
                    Measured metrics
                  </TableCell>
                  <TableCell
                    colSpan={5}
                    align="center"
                    style={{ backgroundColor: '#E1F5FE' }}
                  >
                    Forecasting completion
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>On</TableCell>
                  <TableCell>Velocity</TableCell>
                  <TableCell>Effort %</TableCell>
                  <TableCell>Remaining Points</TableCell>
                  <TableCell>Effort</TableCell>
                  <TableCell>Velocity</TableCell>
                  <TableCell>Time to completion</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completionStreams.map((s: any) => {
                  const lastWeek = s.weeks.slice(-1)[0];
                  // Get corresponding key from forecast streams
                  const fs = forecastStreams.find(
                    (fs: any) => fs.key === s.key,
                  );
                  // console.log(fs);
                  return (
                    <TableRow key={s.key}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>
                        {format(lastWeek.firstDay, 'LLL do')}
                      </TableCell>
                      <TableCell align="right">
                        {Math.round(lastWeek.metrics[metric].velocity * 10) /
                          10}{' '}
                        {metric === 'points' ? 'p/w' : 'i/w'}
                      </TableCell>
                      <TableCell align="right">
                        {lastWeek.metrics[metric].velocity > 0
                          ? Math.round(
                              (lastWeek.metrics[metric].velocity /
                                totalStreamsVelocity) *
                                100,
                            )
                          : 0}
                        %
                      </TableCell>
                      <TableCell align="right">
                        {fs === undefined ? '-' : fs.remaining}
                      </TableCell>
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
                        {fs === undefined ? '-' : fs.effortPct}%
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
                      <TableCell align="right">
                        {fs === undefined ? '-' : fs.velocity}{' '}
                        {metric === 'points' ? 'p/w' : 'i/w'}
                      </TableCell>
                      <TableCell align="right">
                        {fs === undefined ? '-' : fs.timeToCompletion} w
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell align="right" colSpan={2}>
                    TOTAL
                  </TableCell>
                  <TableCell align="right">
                    {Math.round(totalStreamsVelocity * 10) / 10}
                  </TableCell>
                  <TableCell align="right">100%</TableCell>
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

export default connect(mapState, mapDispatch)(Review);
