import React, { FC } from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { format } from 'date-fns';
import { connect } from 'react-redux';

import { iRootState } from '../../../store';

const mapState = (state: iRootState) => ({
  showDeleteModal: state.teams.showDeleteModal,
  deleteModalCacheDays: state.teams.deleteModalCacheDays,
});

const mapDispatch = (dispatch: any) => ({
  setShowDeleteModal: dispatch.teams.setShowDeleteModal,
  clearCacheDay: dispatch.teams.clearCacheDay,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const DeleteModal: FC<connectedProps> = ({
  showDeleteModal,
  setShowDeleteModal,
  clearCacheDay,
  deleteModalCacheDays,
}) => {
  const closeModal = () => {
    setShowDeleteModal(false);
  };

  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    new Date(),
  );

  const clearDay = () => {
    if (selectedDate !== null) {
      clearCacheDay(format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    <Dialog
      fullWidth={true}
      maxWidth={'md'}
      open={showDeleteModal}
      onClose={closeModal}
      aria-labelledby="max-width-dialog-title"
    >
      <DialogTitle id="max-width-dialog-title">Cache management</DialogTitle>
      <DialogContent>
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          spacing={3}
        >
          <Grid item>
            <span>
              The tool caches data for past days and needs a manual action to
              refresh its cache.
              <br />
              If, in Jira, you update metadata about an issue closed in the
              past, the new data will not be fetched since it is already present
              in cache.
              <br />A maximum of 5 days can be refreshed at once, the refresh
              actually happens next time data is loaded by the backend.
            </span>
          </Grid>
          <Grid item>
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              spacing={3}
              alignItems="flex-start"
            >
              <Grid item xs={8}>
                <Typography variant="h6">
                  Pick a day to remove from cache (and load again)
                </Typography>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  spacing={3}
                  alignItems="center"
                >
                  <Grid item>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Pick a day"
                        value={selectedDate}
                        onChange={handleDateChange}
                        renderInput={(params: any) => <TextField {...params} />}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={clearDay}
                      color="primary"
                      disabled={deleteModalCacheDays.length >= 5}
                    >
                      Clear
                    </Button>
                  </Grid>
                  <Grid item xs={12}></Grid>
                </Grid>
                <span>
                  If days does not show up after clicking on clear, it probably
                  means there was no data for that day
                </span>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h6">Will be cleared (5 max)</Typography>
                <List dense={true}>
                  {deleteModalCacheDays.map((day: string) => {
                    return (
                      <ListItem key={day}>
                        <ListItemText primary={day} />
                      </ListItem>
                    );
                  })}
                </List>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeModal} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(mapState, mapDispatch)(DeleteModal);
