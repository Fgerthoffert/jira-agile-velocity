import React, { FC } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';

import NodesGraph from './NodesGraph';
import ResetGraph from './ResetGraph';
import RedrawGraph from './RedrawGraph';

const Graph: FC<any> = () => {
  return (
    <Paper>
      <Grid container direction="row" justifyContent="flex-start" spacing={3}>
        <Grid item xs={2}>
          <Grid
            container
            direction="column"
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={1}
          >
            <Grid item>
              <Grid
                container
                direction="column"
                justifyContent="space-evenly"
                alignItems="flex-start"
              >
                <Grid item>
                  <ResetGraph />
                </Grid>
                <Grid item>
                  <RedrawGraph />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <span>
                <b>Shapes:</b>
                <br />
                Diamond: Initiative <br />
                Square: Epic <br />
                Round: Story <br />
              </span>
            </Grid>
            <Grid item>
              <b>Colors:</b>
              <br />
              Blue: Open <br />
              Yellow: In Progress <br />
              Green: Closed <br />
            </Grid>
            <Grid item>
              <b>Number:</b> points <br />
              <i>Click on node to open in Jira</i>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={10}>
          <NodesGraph />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Graph;
