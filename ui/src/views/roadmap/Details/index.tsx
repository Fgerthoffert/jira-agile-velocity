import React, { FC } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';

import Epcis from './Epics';
import History from './History';
import Graph from './Graph';
import { connect } from 'react-redux';

import { iRootState } from '../../../store';

const mapState = (state: iRootState) => ({
  openGraph: state.roadmap.openGraph,
  roadmap: state.roadmap.roadmap,
  graphInitiative: state.roadmap.graphInitiative,
});

const mapDispatch = (dispatch: any) => ({
  setOpenGraph: dispatch.roadmap.setOpenGraph,
  setInitiativeHistory: dispatch.roadmap.setInitiativeHistory,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Details: FC<connectedProps> = ({
  openGraph,
  roadmap,
  setOpenGraph,
  graphInitiative,
  setInitiativeHistory,
}) => {
  const [tabValue, setTabValue] = React.useState('epics');

  const handleTabChange = (value: string) => {
    setTabValue(value);
  };

  const closeGraph = () => {
    setOpenGraph(false);
    setInitiativeHistory(false);
  };

  if (openGraph === false) {
    return null;
  }
  return (
    <Dialog
      fullWidth={true}
      maxWidth={'xl'}
      open={openGraph}
      onClose={closeGraph}
      aria-labelledby="max-width-dialog-title"
    >
      <DialogTitle id="max-width-dialog-title">
        {graphInitiative.summary + '(' + graphInitiative.key + ')'}
      </DialogTitle>
      <DialogContent>
        <Grid container direction="row" justify="flex-start" spacing={3}>
          <Grid item xs={8}>
            <Grid container direction="column" justify="flex-start" spacing={3}>
              <Grid item>
                <Graph />
              </Grid>
              <Grid item>
                <Epcis
                  children={graphInitiative.children.filter(
                    (c: any) => c.type.name === 'Epic',
                  )}
                  jiraHost={roadmap.host}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <History initiativeKey={graphInitiative.key} />
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
