import React, { FC } from 'react';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { iRootState } from '../../store';

const mapState = (state: iRootState) => ({
  loggedIn: state.global.loggedIn,
  authMessage: state.global.authMessage,
  username: state.global.username,
  password: state.global.password,
  loading: state.global.loading,
  auth0Initialized: state.global.auth0Initialized,
});

const mapDispatch = (dispatch: any) => ({
  setUsername: dispatch.global.setUsername,
  setPassword: dispatch.global.setPassword,
  initAuth: dispatch.global.initAuth,
  setAuthMessage: dispatch.global.setAuthMessage,
  loginCallback: dispatch.global.loginCallback,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const LoginDialog: FC<connectedProps> = ({
  loggedIn,
  auth0Initialized,
  authMessage,
  initAuth,
  setAuthMessage,
  loginCallback,
  loading,
}) => {
  if (loading) {
    return null;
  }
  if (!auth0Initialized && !loading) {
    initAuth();
    return null;
  }

  const query = window.location.search;
  if (query.includes('error_description=')) {
    const errorMsg = new URLSearchParams(window.location.search).get(
      'error_description',
    );
    if (errorMsg !== authMessage) {
      setAuthMessage(errorMsg);
    }
  }
  if (
    query.includes('code=') &&
    query.includes('state=') &&
    loggedIn === false &&
    auth0Initialized === true
  ) {
    loginCallback();
  }

  const openLogin = async () => {
    await window.Auth0.loginWithRedirect({
      redirect_uri: window.location.origin,
    });
  };

  if (!auth0Initialized) {
    return null;
  }

  return (
    <Dialog open={!loggedIn} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Please Log-in</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You will be redirected to{' '}
          <a
            href="https://auth0.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Auth0
          </a>
          , our authentication provider
          <br />
          <span style={{ color: '#f44336' }}>{authMessage}</span>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={openLogin} color="primary">
          Log-in
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default connect(mapState, mapDispatch)(LoginDialog);
