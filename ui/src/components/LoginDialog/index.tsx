import React, { FC } from 'react';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

import { iRootState } from '../../store';

const mapState = (state: iRootState) => ({
  loggedIn: state.global.loggedIn,
  username: state.global.username,
  password: state.global.password
});

const mapDispatch = (dispatch: any) => ({
  logUserIn: dispatch.global.logUserIn,
  setUsername: dispatch.global.setUsername,
  setPassword: dispatch.global.setPassword
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const LoginDialog: FC<connectedProps> = ({
  loggedIn,
  username,
  password,
  logUserIn,
  setUsername,
  setPassword
}) => {
  const handleLogin = () => {
    logUserIn();
  };

  const updateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const updatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  return (
    <Dialog open={!loggedIn} aria-labelledby='form-dialog-title'>
      <DialogTitle id='form-dialog-title'>Login</DialogTitle>
      <DialogContent>
        <DialogContentText>Please log-in to use the app</DialogContentText>
        <TextField
          autoFocus
          margin='dense'
          id='username'
          label='Username'
          value={username}
          onChange={updateUsername}
          fullWidth
        />
        <TextField
          autoFocus
          margin='dense'
          id='password'
          label='Password'
          value={password}
          onChange={updatePassword}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogin} color='primary'>
          Log-in
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(
  mapState,
  mapDispatch
)(LoginDialog);
