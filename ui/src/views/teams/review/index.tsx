import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';

import { format } from 'date-fns';

import { RootState, Dispatch } from '../../../store';

import { CompletionStream } from '../../../global';

const Review = () => {
  const dispatch = useDispatch<Dispatch>();
  const setSimulatedStreams = dispatch.teams.setSimulatedStreams;
  const defaultPoints = useSelector(
    (state: RootState) => state.global.defaultPoints,
  );
  const completionStreams = useSelector(
    (state: RootState) => state.teams.completionStreams,
  );
  const forecastStreams = useSelector(
    (state: RootState) => state.teams.forecastStreams,
  );
  const simulatedStreams = useSelector(
    (state: RootState) => state.teams.simulatedStreams,
  );
  const metric = !defaultPoints ? 'issues' : 'points';

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
                    Current metrics
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ backgroundColor: '#F1F8E9' }}
                  >
                    Remaining
                  </TableCell>
                  <TableCell
                    colSpan={3}
                    align="center"
                    style={{ backgroundColor: '#E1F5FE' }}
                  >
                    Forecast using current metrics
                  </TableCell>
                  <TableCell
                    colSpan={4}
                    align="center"
                    style={{ backgroundColor: '#FFFDE7' }}
                  >
                    Custom projections
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>On</TableCell>
                  <TableCell align="right">Velocity</TableCell>
                  <TableCell align="right">Distribution</TableCell>
                  <TableCell align="right">
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </TableCell>
                  <TableCell align="right">Distribution</TableCell>
                  <TableCell align="right">Velocity</TableCell>
                  <TableCell align="right">Effort</TableCell>
                  <TableCell align="right">Distribution</TableCell>
                  <TableCell align="right">Velocity</TableCell>
                  <TableCell align="right">Effort</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completionStreams.map((s: any) => {
                  const lastWeek = s.weeks.slice(-1)[0];
                  // Get corresponding key from forecast streams
                  const fs = forecastStreams.find(
                    (fs: any) => fs.key === s.key,
                  );
                  // Get corresponding key from simulated streams
                  const ss = simulatedStreams.find(
                    (ss: any) => ss.key === s.key,
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
                        {fs === undefined ? '-' : fs.metrics[metric].remaining}
                      </TableCell>
                      <TableCell align="right">
                        {fs === undefined
                          ? '-'
                          : Math.round(fs.metrics[metric].distribution)}
                        %
                      </TableCell>
                      <TableCell align="right">
                        {fs === undefined
                          ? '-'
                          : Math.round(lastWeek.metrics[metric].velocity * 10) /
                            10}{' '}
                        {metric === 'points' ? 'p/w' : 'i/w'}
                      </TableCell>
                      <TableCell align="right">
                        {fs === undefined
                          ? '-'
                          : Math.round(
                              (fs.metrics[metric].remaining /
                                fs.metrics[metric].velocity) *
                                10,
                            ) / 10}{' '}
                        w
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          id="standard-number"
                          label={`Goal: ${Math.round(
                            fs.metrics[metric].distributionTarget,
                          )}%`}
                          inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*',
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          variant="standard"
                          size="small"
                          margin="dense"
                          value={
                            ss === undefined
                              ? '-'
                              : Math.round(ss.metrics[metric].distribution)
                          }
                          style={{ width: 80 }}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const updatedStreams = simulatedStreams.map(
                              (us: any) => {
                                if (us.key === s.key) {
                                  // console.log(us);
                                  return {
                                    ...us,
                                    metrics: {
                                      issues: {
                                        ...us.metrics.issues,
                                        distribution: Number(
                                          event.target.value,
                                        ),
                                        velocity:
                                          (us.metrics.issues.totalStreams /
                                            100) *
                                          Number(event.target.value),
                                      },
                                      points: {
                                        ...us.metrics.points,
                                        distribution: Number(
                                          event.target.value,
                                        ),
                                        velocity:
                                          (us.metrics.points.totalStreams /
                                            100) *
                                          Number(event.target.value),
                                      },
                                    },
                                  };
                                }
                                return { ...us };
                              },
                            );
                            // console.log(updatedStreams);
                            setSimulatedStreams(updatedStreams);
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {ss === undefined
                          ? '-'
                          : Math.round(ss.metrics[metric].velocity * 10) /
                            10}{' '}
                        {metric === 'points' ? 'p/w' : 'i/w'}
                      </TableCell>
                      <TableCell align="right">
                        {ss === undefined
                          ? '-'
                          : Math.round(
                              (ss.metrics[metric].remaining /
                                ss.metrics[metric].velocity) *
                                10,
                            ) / 10}{' '}
                        w
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell align="right" colSpan={2}>
                    TOTAL
                  </TableCell>
                  <TableCell align="right">
                    {Math.round(totalStreamsVelocity * 10) / 10}{' '}
                    {metric === 'points' ? 'p/w' : 'i/w'}
                  </TableCell>
                  <TableCell align="right">100%</TableCell>
                  <TableCell align="right">
                    {forecastStreams
                      .map((s: any) => s.metrics[metric].remaining)
                      .reduce((acc: number, value: number) => acc + value, 0)}
                  </TableCell>
                  <TableCell align="right">
                    {Math.round(
                      forecastStreams
                        .map((s: any) => s.metrics[metric].distribution)
                        .reduce((acc: number, value: number) => acc + value, 0),
                    )}
                    %
                  </TableCell>
                  <TableCell align="right">
                    {Math.round(
                      forecastStreams
                        .map((s: any) => s.metrics[metric].velocity)
                        .reduce(
                          (acc: number, value: number) => acc + value,
                          0,
                        ) * 10,
                    ) / 10}{' '}
                    {metric === 'points' ? 'p/w' : 'i/w'}
                  </TableCell>
                  <TableCell align="right">-</TableCell>
                  <TableCell align="right">
                    {Math.round(
                      simulatedStreams
                        .map((s: any) => s.metrics[metric].distribution)
                        .reduce((acc: number, value: number) => acc + value, 0),
                    )}
                    %
                  </TableCell>
                  <TableCell align="right">
                    {Math.round(
                      simulatedStreams
                        .map((s: any) => s.metrics[metric].velocity)
                        .reduce(
                          (acc: number, value: number) => acc + value,
                          0,
                        ) * 10,
                    ) / 10}{' '}
                    {metric === 'points' ? 'p/w' : 'i/w'}
                  </TableCell>
                  <TableCell align="right">-</TableCell>
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

export default Review;
