import * as log from 'loglevel';
import { createModel } from '@rematch/core';
import axios from 'axios';
import { reactLocalStorage } from 'reactjs-localstorage';

declare global {
  interface Window {
    _env_: any;
  }
}

interface Teams {
  state: any;
  reducers: any;
  effects: any;
}

export const teams: Teams = {
  state: {
    selectedTeam: null,
    selectedTeamId: null,
    loading: false,
    completionData: null,
  },
  reducers: {
    setTeams(state: any, payload: any) {
      return { ...state, teams: payload };
    },
    setCompletionData(state: any, payload: any) {
      return { ...state, completionData: payload };
    },
    setSelectedTeam(state: any, payload: any) {
      return { ...state, selectedTeam: payload };
    },
    setSelectedTeamId(state: any, payload: any) {
      return { ...state, selectedTeamId: payload };
    },
    setLoading(state: any, payload: any) {
      return { ...state, loading: payload };
    },
  },
  effects: {
    async initView(teamObj: any, rootState: any) {
      console.log(teamObj);
      const { selectedTeamId, selectedTab } = teamObj;
      const log = rootState.global.log;
      log.info(`Initialized Team view (tean: ${selectedTeamId})`);

      this.loadVelocityFromCache(selectedTeamId);
      if (
        JSON.parse(window._env_.AUTH0_DISABLED) === true ||
        (JSON.parse(window._env_.AUTH0_DISABLED) !== true &&
          rootState.global.accessToken !== '')
      ) {
        log.info('Loading data');
        this.fetchTeamData(selectedTeamId);
      } else {
        log.info(
          'Not loading data, either there is already some data in cache or user token not (yet) present',
        );
      }
    },

    async loadVelocityFromCache(teamId: any) {
      // If previous data was loaded and saved in localstorage
      // it will first display the cache, while the call to the backend is happening
      const cacheVelocity = reactLocalStorage.getObject(
        `cache-velocity-${teamId}`,
      );
      if (
        Object.keys(cacheVelocity).length > 0 &&
        cacheVelocity.find((t: any) => t.id === teamId) !== undefined
      ) {
        log.info(
          'Loading Velocity data from cache while call to the backend is happening',
        );
        this.setCompletionData(
          reactLocalStorage.getObject(`cache-velocity-${teamId}`),
        );
      }
    },

    async fetchTeamData(teamId: any, rootState: any) {
      this.loadVelocityFromCache(teamId);
      if (rootState.teams.loading === false) {
        const setCompletionData = this.setCompletionData;
        const setLoading = this.setLoading;
        const setSelectedTeam = this.setSelectedTeam;
        if (teamId !== null) {
          const log = rootState.global.log;
          log.info('Fetching data for team: ' + teamId);

          setLoading(true);
          const host =
            window._env_.API_URL !== undefined
              ? window._env_.API_URL
              : 'http://127.0.0.1:3001';
          const headers =
            JSON.parse(window._env_.AUTH0_DISABLED) !== true
              ? { Authorization: `Bearer ${rootState.global.accessToken}` }
              : {};
          axios({
            method: 'get',
            url: host + '/velocity/' + teamId,
            headers,
          })
            .then((response) => {
              console.log(response.data.velocity);
              setCompletionData(response.data.velocity);
              setSelectedTeam(response.data.velocity.name);
              console.log(response.data.velocity.name);
              reactLocalStorage.setObject(
                `cache-velocity-${rootState.teams.setSelectedTeamId}`,
                response.data.velocity,
              );
              setLoading(false);
            })
            .catch((error) => {
              console.log(error);
              setLoading(false);
            });
        }
      }
    },
  },
};
