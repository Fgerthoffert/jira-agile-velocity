import React, { FC } from 'react';
import Grid from '@mui/material/Grid';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Epcis from './Epics';
import History from './History';
import Graph from './Graph';
import { useSelector, useDispatch } from 'react-redux';

import { RootState, Dispatch } from '../../../store';

const GraphModal = () => {
  const openGraph = useSelector(
    (state: RootState) => state.initiatives.openGraph,
  );
  const roadmap = useSelector((state: RootState) => state.initiatives.roadmap);
  const graphInitiative = useSelector(
    (state: RootState) => state.initiatives.graphInitiative,
  );
  const jiraHost = useSelector(
    (state: RootState) => state.initiatives.jiraHost,
  );
  const dispatch = useDispatch<Dispatch>();
  const setOpenGraph = dispatch.initiatives.setOpenGraph;
  const setInitiativeHistory = dispatch.initiatives.setInitiativeHistory;

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
        <Grid container direction="row" justifyContent="flex-start" spacing={3}>
          <Grid item xs={8}>
            <Grid
              container
              direction="column"
              justifyContent="flex-start"
              spacing={3}
            >
              <Grid item>
                <Graph />
              </Grid>
              <Grid item>
                <Epcis
                  epics={graphInitiative.children.filter(
                    (c: any) => c.type.name === 'Epic',
                  )}
                  jiraHost={jiraHost}
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

export default GraphModal;
