import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { format } from 'date-fns';

import { RootState, Dispatch } from '../../../store';
import { VIssue } from '../../../global';

const IssuesModal = () => {
  const dispatch = useDispatch<Dispatch>();
  const setShowIssuesModal = dispatch.versions.setShowIssuesModal;
  const showIssuesModal = useSelector(
    (state: RootState) => state.versions.showIssuesModal,
  );
  const issuesModalIssues = useSelector(
    (state: RootState) => state.versions.issuesModalIssues,
  );
  const issuesModalTitle = useSelector(
    (state: RootState) => state.versions.issuesModalTitle,
  );
  const jiraHost = useSelector((state: RootState) => state.versions.jiraHost);

  const closeModal = () => {
    setShowIssuesModal(false);
  };

  return (
    <Dialog
      fullWidth={true}
      maxWidth={'xl'}
      open={showIssuesModal}
      onClose={closeModal}
      aria-labelledby="max-width-dialog-title"
    >
      <DialogTitle id="max-width-dialog-title">
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={1}
        >
          <Grid item>{issuesModalTitle}</Grid>
          <Grid item xs={12} sm container></Grid>
          <Grid item>
            <IconButton
              aria-label="open-external"
              size="small"
              href={
                jiraHost +
                '/issues/?jql=key in (' +
                issuesModalIssues.map((i: VIssue) => i.key).join() +
                ')'
              }
              rel="noopener noreferrer"
              target="_blank"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={8}></TableCell>
              <TableCell align="center" colSpan={3}>
                Time to resolution
              </TableCell>
              <TableCell align="center" colSpan={2}></TableCell>
              <TableCell align="center" colSpan={3}>
                Time to release
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{ width: 50 }}></TableCell>
              <TableCell style={{ width: 150 }}>Key</TableCell>
              <TableCell style={{ width: 150 }}>Type</TableCell>
              <TableCell>Summary</TableCell>
              <TableCell style={{ width: 120 }}>Status</TableCell>
              <TableCell style={{ width: 120 }}>Priority</TableCell>
              <TableCell style={{ width: 120 }}>Created</TableCell>
              <TableCell style={{ width: 120 }}>Resolved</TableCell>
              <TableCell style={{ width: 50 }}>Days</TableCell>
              <TableCell style={{ width: 50 }}>Weeks</TableCell>
              <TableCell style={{ width: 50 }}>Months</TableCell>
              <TableCell>Release Name</TableCell>
              <TableCell style={{ width: 120 }}>Released</TableCell>
              <TableCell style={{ width: 50 }}>Days</TableCell>
              <TableCell style={{ width: 50 }}>Weeks</TableCell>
              <TableCell style={{ width: 50 }}>Months</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issuesModalIssues.map((i: VIssue) => {
              return (
                <TableRow
                  key={i.key}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <IconButton
                      aria-label="open-external"
                      size="small"
                      href={encodeURI(jiraHost + `/browse/${i.key}`)}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell>{i.key}</TableCell>
                  <TableCell>{i.type}</TableCell>
                  <TableCell>{i.summary}</TableCell>
                  <TableCell>{i.status}</TableCell>
                  <TableCell>
                    {i.priority !== undefined ? i.priority : ''}
                  </TableCell>
                  <TableCell>
                    {format(new Date(i.created), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell>
                    {i.resolutiondate === undefined
                      ? ''
                      : format(new Date(i.resolutiondate), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell>{i.daysToResolution}</TableCell>
                  <TableCell>{i.weeksToResolution}</TableCell>
                  <TableCell>{i.monthsToResolution}</TableCell>
                  <TableCell>
                    {i.release === undefined ? '' : i.release.name}
                  </TableCell>
                  <TableCell>
                    {i.release.releaseDate === undefined ||
                    i.release.releaseDate === null
                      ? 'Unreleased'
                      : format(new Date(i.release.releaseDate), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell>
                    {i.daysToReleaseIfToday !== undefined
                      ? `${i.daysToReleaseIfToday} (if today)`
                      : i.daysToRelease}
                  </TableCell>
                  <TableCell>
                    {i.weeksToReleaseIfToday !== undefined
                      ? `${i.weeksToReleaseIfToday} (if today)`
                      : i.weeksToRelease}
                  </TableCell>
                  <TableCell>
                    {i.monthsToReleaseIfToday !== undefined
                      ? `${i.monthsToReleaseIfToday} (if today)`
                      : i.monthsToRelease}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssuesModal;
