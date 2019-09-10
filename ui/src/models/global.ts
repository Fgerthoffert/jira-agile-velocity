// https://github.com/pimterry/loglevel
import * as log from 'loglevel';
import { createModel } from '@rematch/core';

import axios from 'axios';

export const global = createModel({
  state: {
    log: {},
    showMenu: false,
    pageTitle: null,
    defaultPoints: true,

    // Authentication module
    loggedIn: false, // Is the user logged in
    username: '',
    password: '',
    accessToken: ''
  },
  reducers: {
    setLog(state: any, payload: any) {
      return { ...state, log: payload };
    },
    setLoggedIn(state: any, payload: any) {
      return { ...state, loggedIn: payload };
    },
    setUsername(state: any, payload: any) {
      return { ...state, username: payload };
    },
    setPassword(state: any, payload: any) {
      return { ...state, password: payload };
    },
    setAccessToken(state: any, payload: any) {
      return { ...state, accessToken: payload };
    },
    setShowMenu(state: any, payload: any) {
      return { ...state, showMenu: payload };
    },
    setPageTitle(state: any, payload: any) {
      return { ...state, pageTitle: payload };
    },
    setDefaultPoints(state: any, payload: any) {
      return { ...state, defaultPoints: payload };
    }
  },
  effects: {
    async initApp() {
      const logger = log.noConflict();
      if (process.env.NODE_ENV !== 'production') {
        logger.enableAll();
      } else {
        logger.disableAll();
      }
      logger.info('Logger initialized');
      this.setLog(logger);
    },
    async logUserIn(payload, rootState) {
      console.log('Log user in');
      // Fetch data
      console.log(rootState.global.accessToken);
      const host =
        window._env_.API_URL !== undefined
          ? window._env_.API_URL
          : 'http://127.0.0.1:3001';
      axios({
        method: 'post',
        url: host + '/login',
        data: {
          username: rootState.global.username,
          password: rootState.global.password
        }
      })
        .then(response => {
          console.log(response);
          if (response.status === 201) {
            this.setAccessToken(response.data.access_token);
            this.setLoggedIn(true);
          }
        })
        .catch(error => {
          this.setAccessToken('');
          this.setLoggedIn(false);
        });
    }
  }
});
