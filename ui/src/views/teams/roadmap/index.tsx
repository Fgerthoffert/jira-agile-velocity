import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { RootState } from '../../../store';

import RoadmapTable from './RoadmapTable';
import TicketsTable from './TicketsTable';

const Roadmap = () => {
  const defaultPoints = useSelector(
    (state: RootState) => state.global.defaultPoints,
  );
  const forecastStreams = useSelector(
    (state: RootState) => state.teams.forecastStreams,
  );
  const jiraHost = useSelector((state: RootState) => state.teams.jiraHost);

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

export default Roadmap;
