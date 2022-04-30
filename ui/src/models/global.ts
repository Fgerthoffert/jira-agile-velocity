/* eslint-disable @typescript-eslint/no-explicit-any */
import * as log from 'loglevel';
import createAuth0Client from '@auth0/auth0-spa-js';
import axios from 'axios';
import { reactLocalStorage } from 'reactjs-localstorage';

declare global {
  interface Window {
    Auth0: any;
  }
}

const setAuth0Config = async () => {
  const authConfig = {
    domain: window._env_.AUTH0_DOMAIN,
    clientId: window._env_.AUTH0_CLIENT_ID,
    audience: window._env_.AUTH0_AUDIENCE,
  };

  // eslint-disable-next-line
  window.Auth0 = await createAuth0Client({
    domain: authConfig.domain,
    // eslint-disable-next-line
    client_id: authConfig.clientId,
    audience: authConfig.audience,
  });
  return window.Auth0;
};

interface Global {
  state: any;
  reducers: any;
  effects: any;
}

export const global: Global = {
  state: {
    log: {},
    loading: false,
    showMenu: false,
    pageTitle: null,
    defaultPoints: true,

    // Authentication module
    loggedIn: false, // Is the user logged in
    auth0Initialized: false,
    authUser: {},
    authMessage: '',
    username: true,
    password: '',
    accessToken: '',

    loginMenuOpen: false,

    teams: [],
  },
  reducers: {
    setLog(state: any, payload: any) {
      return { ...state, log: payload };
    },
    setLoading(state: any, payload: any) {
      return { ...state, loading: payload };
    },
    setAuth0Initialized(state: any, payload: any) {
      return { ...state, auth0Initialized: payload };
    },
    setAuthMessage(state: any, payload: any) {
      return { ...state, authMessage: payload };
    },
    setAuthUser(state: any, payload: any) {
      return { ...state, authUser: payload };
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
    },
    setLoginMenuOpen(state: any, payload: any) {
      return { ...state, loginMenuOpen: payload };
    },
    setCallbackState(state: any, payload: any) {
      return {
        ...state,
        loggedIn: payload.loggedIn,
        accessToken: payload.accessToken,
        authUser: payload.authUser,
        auth0Initialized: payload.auth0Initialized,
      };
    },
    setTeams(state: any, payload: any) {
      return { ...state, teams: payload };
    },
  },
  effects: {
    async initApp(payload: any, rootState: any) {
      const logger = log.noConflict();
      if (process.env.NODE_ENV !== 'production') {
        logger.enableAll();
      } else {
        logger.disableAll();
      }
      logger.info('[Global] Logger initialized');
      this.setLog(logger);

      if (
        JSON.parse(window._env_.AUTH0_DISABLED) === true ||
        (JSON.parse(window._env_.AUTH0_DISABLED) !== true &&
          rootState.global.accessToken !== '')
      ) {
        logger.info('Loading list of teams');
        this.refreshTeams();
      } else {
        logger.info(
          'Not loading data, either there is already some data in cache or user token not (yet) present',
        );
      }
    },

    async doLogOut() {
      if (window.Auth0 !== undefined) {
        window.Auth0.logout({
          returnTo: window.location.origin,
        });
        this.setLoggedIn(false);
        this.setAuth0Initialized(false);
        this.setAuthMessage('');
        this.setAccessToken('');
        this.setAuthUser(null);
      }
    },

    async initAuth() {
      if (JSON.parse(window._env_.AUTH0_DISABLED) !== true) {
        console.log('User not logged in, initializing authentication');
        if (window.Auth0 !== undefined) {
          this.setAuth0Initialized(true);
        } else {
          this.setLoading(true);
          await setAuth0Config();
          this.setAuth0Initialized(true);
          this.setLoading(false);
          const isLoggedIn = await window.Auth0.isAuthenticated();
          if (isLoggedIn === true) {
            const accessToken = await window.Auth0.getTokenSilently();
            const user = await window.Auth0.getUser();
            this.setCallbackState({
              loggedIn: isLoggedIn,
              accessToken,
              authUser: user,
            });
          }
          console.log('Authentication initialized');
        }
      }
    },

    async loginCallback(payload: any, rootState: any) {
      // tslint:disable-next-line:no-shadowed-variable
      this.setLoading(true);
      console.log('Received callback, finalizing logging');
      const auth0 =
        window.Auth0 === undefined ? await setAuth0Config() : window.Auth0;
      if (window.Auth0 !== undefined && rootState.global.loggedIn === false) {
        await auth0.handleRedirectCallback();

        const isLoggedIn = await auth0.isAuthenticated();
        if (isLoggedIn === true) {
          const accessToken = await auth0.getTokenSilently();
          const user = await auth0.getUser();
          this.setCallbackState({
            loggedIn: isLoggedIn,
            accessToken,
            authUser: user,
          });
        } else {
          this.setCallbackState({
            loggedIn: isLoggedIn,
            accessToken: '',
            authUser: null,
          });
        }
      }
      this.setLoading(false);
    },

    async refreshTeams(currentTab: any, rootState: any) {
      const setTeams = this.setTeams;
      const setLoading = this.setLoading;
      setLoading(true);
      const host =
        window._env_.API_URL !== undefined
          ? window._env_.API_URL
          : 'http://127.0.0.1:3001';
      const headers =
        JSON.parse(window._env_.AUTH0_DISABLED) !== true
          ? { Authorization: `Bearer ${rootState.global.accessToken}` }
          : undefined;
      axios({
        method: 'get',
        url: host + '/teams',
        headers,
      })
        .then((response) => {
          console.log('[Global] setting teams fo: ', response.data);
          setTeams(response.data);
          reactLocalStorage.setObject('cache-velocityTeams', response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setTeams([]);
          setLoading(false);
        });
    },
  },
};
