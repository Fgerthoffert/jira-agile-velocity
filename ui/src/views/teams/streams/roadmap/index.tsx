import React, { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { RootState } from '../../../../store';

import RoadmapTable from './RoadmapTable';
import TicketsTable from './TicketsTable';
import OpenVsClosed from './OpenVsClosed';
import Resolution from './Resolution';
import MeanTimeToResolution from './MeanTimeToResolution';

interface Props {
  streamId: string;
}

const Roadmap: FC<Props> = ({ streamId }) => {
  const defaultPoints = useSelector(
    (state: RootState) => state.global.defaultPoints,
  );
  const forecastStreams = useSelector(
    (state: RootState) => state.teams.forecastStreams,
  );
  const completionStreams = useSelector(
    (state: RootState) => state.teams.completionStreams,
  );
  const jiraHost = useSelector((state: RootState) => state.teams.jiraHost);

  const resolutions = useSelector(
    (state: RootState) => state.teams.resolutions,
  );
  const positiveResolutions = resolutions.positive;
  const negativeResolutions = resolutions.negative;
  const ignoreResolutions = resolutions.ignore;

  if (forecastStreams.length > 0) {
    return forecastStreams
      .filter((s: any) => s.key === streamId)
      .map((stream: any) => {
        return (
          <React.Fragment key={stream.key}>
            <Grid item>
              <Typography variant="h5" component="h5">
                Stream: {stream.name}
              </Typography>
            </Grid>

            <Grid item>
              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="stretch"
                spacing={3}
              >
                <Grid item xs={4}>
                  <Paper>
                    <Typography variant="h5" component="h5">
                      Resolutions - Past 12 months
                    </Typography>
                    <Resolution
                      streamKey={stream.key}
                      completionStreams={completionStreams}
                      positiveResolutions={positiveResolutions}
                      negativeResolutions={negativeResolutions}
                      ignoreResolutions={ignoreResolutions}
                      jiraHost={jiraHost}
                    />
                    <Typography component="p">
                      The lines represent an arbitrary evaluation of the
                      outcome, either{' '}
                      {positiveResolutions.length > 0
                        ? `positive (using resolutions: ${positiveResolutions.toString()})`
                        : ''}
                      {negativeResolutions.length > 0
                        ? `, negative (using resolutions: ${negativeResolutions.toString()})`
                        : ''}
                      {ignoreResolutions.length > 0
                        ? `. Tickets with the
                      following resolutions are ignored: ${ignoreResolutions.toString()}`
                        : ''}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper>
                    <Typography variant="h5" component="h5">
                      Mean time to resolution - Past 12 months
                    </Typography>
                    <MeanTimeToResolution
                      streamKey={stream.key}
                      completionStreams={completionStreams}
                      positiveResolutions={positiveResolutions}
                      negativeResolutions={negativeResolutions}
                      ignoreResolutions={ignoreResolutions}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper>
                    <Typography variant="h5" component="h5">
                      Open vs Closed tickets - Past 12 months
                    </Typography>
                    <OpenVsClosed
                      streamKey={stream.key}
                      forecastStreams={forecastStreams}
                      completionStreams={completionStreams}
                    />
                    <Typography component="p">
                      The backlog line aims at <b>demonstrating a trend</b>. It
                      only shows issues created or closed within the past 12
                      months. This number will differ from the backlog of all
                      opened tickets.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>

            <Grid item>
              <Paper>
                <Typography variant="h5" component="h5">
                  Open tickets
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
                  The following query was used:{' '}
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
                  , tickets matching queries above have been excluded to avoid
                  duplicates.
                </Typography>
              </Paper>
            </Grid>
          </React.Fragment>
        );
      });
  }
  return null;
};

export default Roadmap;
