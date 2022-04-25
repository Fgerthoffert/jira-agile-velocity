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
  simulatedStreams: state.teams.simulatedStreams,
});

const mapDispatch = (dispatch: any) => ({
  setSimulatedStreams: dispatch.global.setSimulatedStreams,
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

export const getId = (inputstring: string) => {
  return String(inputstring)
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};

const formatStreams = (streams: any, metric: string) => {
  console.log(streams);
  return streams.map((stream: any) => {
    return {
      ...stream,
      remaining: stream.metrics[metric].remaining,
      items:
        stream.fetchChild === false
          ? []
          : stream.issues
              .map((i: any) => {
                return {
                  name: i.summary,
                  remaining: i.metrics[metric].remaining,
                };
              })
              .filter((i: any) => i.remaining > 0),
    };
  });
};

const Forecast: FC<connectedProps> = ({ defaultPoints, simulatedStreams }) => {
  if (simulatedStreams.length === 0) {
    return null;
  }
  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }

  const currentStreams = formatStreams(simulatedStreams, metric);

  const classes = useStyles();

  return (
    <Paper>
      <Typography variant="h5" component="h3">
        Forecast
      </Typography>
      <Typography component="p">
        Remaining work calculated using {metric}
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <RoadmapChart streams={currentStreams} metric={metric} />
          <Typography component="p" className={classes.smallText}>
            <i>
              Displays remaining effort based on the provided JQL queries and
              current stream velocity.
            </i>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default connect(mapState, mapDispatch)(Forecast);
