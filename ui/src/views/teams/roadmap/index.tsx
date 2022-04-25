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
  forecastData: state.teams.forecastData,
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
  forecastData,
  fetchTeamData,
  setGraphInitiative,
  updateGraph,
  setOpenGraph,
}) => {
  const classes = useStyles();

  const teamVelocity = 20;

  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }
  if (forecastData !== null) {
    return forecastData.forecast.categories.map((c: any) => {
      return (
        <Grid item key={c.name}>
          <Paper>
            <Typography variant="h5" component="h5">
              {c.name}
            </Typography>
            {c.fetchChild ? (
              <RoadmapTable
                defaultPoints={defaultPoints}
                issues={c.issues}
                jiraHost={forecastData.jiraHost}
              />
            ) : (
              <TicketsTable
                defaultPoints={defaultPoints}
                issues={c.issues}
                jiraHost={forecastData.jiraHost}
              />
            )}
            <Typography variant="subtitle2" component="div">
              Query:{' '}
              <a
                href={
                  forecastData.jiraHost +
                  '/issues/?jql=' +
                  encodeURIComponent(c.jql.trim())
                }
                rel="noreferrer"
                target="_blank"
              >
                {c.jql}
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
