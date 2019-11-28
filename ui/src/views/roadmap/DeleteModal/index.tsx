import React, { FC } from 'react';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import format from 'date-fns/format';
import { connect } from 'react-redux';

import { iRootState } from '../../../store';

const mapState = (state: iRootState) => ({
  showDeleteModal: state.roadmap.showDeleteModal,
  deleteModalCacheDays: state.roadmap.deleteModalCacheDays,
});

const mapDispatch = (dispatch: any) => ({
  setShowDeleteModal: dispatch.roadmap.setShowDeleteModal,
  clearCacheDay: dispatch.roadmap.clearCacheDay,
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
        <Grid container direction="column" justify="flex-start" spacing={3}>
          <Grid item>
            <span>
              The tool caches data for past days and needs a manual action to
              refresh its cache.
              <br />
              If, in Jira, you update metadata about an issue closed in the
              past, the new data will not be fetched since it's already present
              in cache.
              <br />A maximum of 5 days can be refreshed at once, the refresh
              actually happens next time data is loaded by the backend.
            </span>
          </Grid>
          <Grid item>
            <Grid
              container
              direction="row"
              justify="flex-start"
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
                  justify="flex-start"
                  spacing={3}
                  alignItems="center"
                >
                  <Grid item>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <KeyboardDatePicker
                        autoOk
                        disableToolbar
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="date-picker-inline"
                        label="Pick a day"
                        value={selectedDate}
                        onChange={handleDateChange}
                        KeyboardButtonProps={{
                          'aria-label': 'change date',
                        }}
                      />
                    </MuiPickersUtilsProvider>
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
                  If days doesn't show up after clicking on clear, it probably
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

export default connect(
  mapState,
  mapDispatch,
)(DeleteModal);
