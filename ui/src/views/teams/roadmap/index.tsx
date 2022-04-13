import React, { FC } from 'react';
import { connect } from 'react-redux';
import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles, styled } from '@mui/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { iRootState } from '../../../store';
import RoadmapChart from './RoadmapChart';

import { Stream } from '../../../global';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3, 2),
    },
    smallText: {
      fontSize: '0.8em',
    },
    updatedAt: {
      textAlign: 'left',
      fontSize: '0.8em',
      fontStyle: 'italic',
    },
  }),
);

const mapState = (state: iRootState) => ({
  defaultPoints: state.global.defaultPoints,
  completionData: state.teams.completionData,
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints,
  fetchTeamData: dispatch.teams.fetchTeamData,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const streams: Array<Stream> = [
  {
    key: 'initiatives',
    name: 'Initiatives',
    remaining: 350,
    effortPct: 50,
    items: [
      {
        name: 'Feature ABC',
        remaining: 45,
      },
      {
        name: 'Feature DEF',
        remaining: 320,
      },
    ],
  },
  {
    key: 'bugs',
    name: 'Bugs',
    remaining: 70,
    effortPct: 20,
    items: [],
  },
  {
    key: 'others',
    name: 'Others',
    remaining: 100,
    effortPct: 30,
    items: [],
  },
];

const StreamsSlider = styled(Slider)(() => ({
  '& .MuiSlider-markLabel': {
    fontSize: 10,
  },
}));

const Vecocity: FC<connectedProps> = ({
  defaultPoints,
  completionData,
  fetchTeamData,
}) => {
  const [currentStreams, setCurrentStreams] =
    React.useState<Array<Stream>>(streams);

  const classes = useStyles();

  const teamVelocity = 20;

  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }
  if (completionData !== null) {
    return (
      <Paper>
        <Typography variant="h5" component="h3">
          Forecast
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={9}>
            <Typography component="p">
              Remaining work calculated using total velocity of {teamVelocity}{' '}
              {metric} / week
            </Typography>
            <RoadmapChart
              streams={currentStreams}
              weeklyVelocity={teamVelocity}
            />
            <Typography component="p" className={classes.smallText}>
              <i>
                Displays remaining effort based on the provided JQL queries and
                current team velocity.
              </i>
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Table size="small" aria-label="Chart configuration">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="right">Effort (%)</TableCell>
                  <TableCell align="right">Velocity (/w)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentStreams.map((s) => {
                  const slideMarks = [
                    {
                      value: 0,
                      label: '0%',
                    },
                    {
                      value: s.effortPct,
                      label: `${s.effortPct}%`,
                    },
                    {
                      value: 100,
                      label: '100%',
                    },
                  ];
                  return (
                    <TableRow key={s.key}>
                      <TableCell component="th" scope="row">
                        {s.name}
                      </TableCell>
                      <TableCell align="right">
                        <StreamsSlider
                          size="small"
                          value={s.effortPct}
                          aria-label="Small"
                          valueLabelDisplay="auto"
                          step={5}
                          marks={slideMarks}
                          min={0}
                          max={100}
                          onChange={(
                            event: Event,
                            newValue: number | number[],
                          ) => {
                            const updatedStreams = currentStreams.map((cs) => {
                              if (cs.name === s.name) {
                                if (
                                  Math.round(
                                    (Number(newValue) * teamVelocity) / 100,
                                  ) > 0
                                ) {
                                  return {
                                    ...cs,
                                    effortPct: Number(newValue),
                                  };
                                }
                              }
                              return cs;
                            });
                            setCurrentStreams(updatedStreams);
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {Math.round((teamVelocity * s.effortPct) / 100)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </Paper>
    );
  }
  return null;
};

export default connect(mapState, mapDispatch)(Vecocity);
