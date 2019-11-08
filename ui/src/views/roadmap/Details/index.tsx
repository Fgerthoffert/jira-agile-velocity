import React, { FC } from 'react';
import Grid from '@material-ui/core/Grid';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import NodesGraph from './NodesGraph';
import ResetGraph from './ResetGraph';
import RedrawGraph from './RedrawGraph';
import { connect } from 'react-redux';

import { iRootState } from '../../../store';

const mapState = (state: iRootState) => ({
  openGraph: state.roadmap.openGraph,
  graphInitiative: state.roadmap.graphInitiative,
});

const mapDispatch = (dispatch: any) => ({
  setOpenGraph: dispatch.roadmap.setOpenGraph,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Details: FC<connectedProps> = ({
  openGraph,
  setOpenGraph,
  graphInitiative,
}) => {
  const closeGraph = () => {
    setOpenGraph(false);
  };

  if (openGraph === false) {
    return null;
  }
  return (
    <Dialog
      fullWidth={true}
      maxWidth={'lg'}
      open={openGraph}
      onClose={closeGraph}
      aria-labelledby="max-width-dialog-title"
    >
      <DialogTitle id="max-width-dialog-title">
        {graphInitiative.summary + '(' + graphInitiative.key + ')'}
      </DialogTitle>
      <DialogContent>
        <Grid container direction="row" justify="flex-start" spacing={3}>
          <Grid item xs={9}>
            <NodesGraph />
          </Grid>
          <Grid item xs={3}>
            <Grid
              container
              direction="column"
              justify="flex-start"
              alignItems="flex-start"
              spacing={1}
            >
              <Grid item>
                <Grid
                  container
                  direction="row"
                  justify="space-evenly"
                  alignItems="center"
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
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeGraph} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(
  mapState,
  mapDispatch,
)(Details);
