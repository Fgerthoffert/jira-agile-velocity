import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { RootState, Dispatch } from '../store';

const LoginDialog = () => {
  const dispatch = useDispatch<Dispatch>();
  const loading = useSelector((state: RootState) => state.global.loading);
  const auth0Initialized = useSelector(
    (state: RootState) => state.global.auth0Initialized,
  );
  const loggedIn = useSelector((state: RootState) => state.global.loggedIn);
  const authMessage = useSelector(
    (state: RootState) => state.global.authMessage,
  );

  if (loading) {
    return null;
  }

  if (!auth0Initialized && !loading) {
    dispatch.global.initAuth();
    return null;
  }

  const query = window.location.search;
  if (query.includes('error_description=')) {
    const errorMsg = new URLSearchParams(window.location.search).get(
      'error_description',
    );
    if (errorMsg !== authMessage) {
      dispatch.global.setAuthMessage(errorMsg);
    }
  }
  if (
    query.includes('code=') &&
    query.includes('state=') &&
    loggedIn === false &&
    auth0Initialized === true
  ) {
    dispatch.global.loginCallback();
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

export default LoginDialog;
