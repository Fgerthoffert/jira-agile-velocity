import React, { FC } from 'react';
import { connect } from 'react-redux';
import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { iRootState } from '../../../store';

import RoadmapTable from './RoadmapTable';
import TicketsTable from './TicketsTable';

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
  forecastStreams: state.teams.forecastStreams,
  jiraHost: state.teams.jiraHost,
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints,
  fetchTeamData: dispatch.teams.fetchTeamData,
  setGraphInitiative: dispatch.teams.setGraphInitiative,
  updateGraph: dispatch.teams.updateGraph,
  setOpenGraph: dispatch.teams.setOpenGraph,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Roadmap: FC<connectedProps> = ({
  defaultPoints,
  forecastStreams,
  jiraHost,
  fetchTeamData,
  setGraphInitiative,
  updateGraph,
  setOpenGraph,
}) => {
  const classes = useStyles();

  const teamVelocity = 20;

  const metric = !defaultPoints ? 'issues' : 'points';

  if (forecastStreams.length > 0) {
    return forecastStreams.map((stream: any) => {
      return (
        <Grid item key={stream.key}>
          <Paper>
            <Typography variant="h5" component="h5">
              {stream.name}
            </Typography>
            {stream.fetchChild ? (
              <RoadmapTable
                defaultPoints={defaultPoints}
                issues={stream.issues}
                jiraHost={jiraHost}
              />
            ) : (
              <TicketsTable
                defaultPoints={defaultPoints}
                issues={stream.issues}
                jiraHost={jiraHost}
              />
            )}
            <Typography variant="subtitle2" component="div">
              Query:{' '}
              <a
                href={
                  jiraHost +
                  '/issues/?jql=' +
                  encodeURIComponent(stream.jql.trim())
                }
                rel="noreferrer"
                target="_blank"
              >
                {stream.jql}
              </a>
              , tickets matching queries above have been excluded.
            </Typography>
          </Paper>
        </Grid>
      );
    });
  }
  return null;
};

export default connect(mapState, mapDispatch)(Roadmap);
