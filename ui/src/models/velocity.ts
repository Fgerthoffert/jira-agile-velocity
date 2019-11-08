import * as log from 'loglevel';
import { createModel } from '@rematch/core';
import axios from 'axios';
import { reactLocalStorage } from 'reactjs-localstorage';

declare global {
  interface Window {
    _env_: any;
  }
}

export const velocity = createModel({
  state: {
    teams: [],
    selectedTeam: null,
    loading: false,
    velocity: [],
  },
  reducers: {
    setTeams(state: any, payload: any) {
      return { ...state, teams: payload };
    },
    setVelocity(state: any, payload: any) {
      return { ...state, velocity: payload };
    },
    setSelectedTeam(state: any, payload: any) {
      return { ...state, selectedTeam: payload };
    },
    setLoading(state: any, payload: any) {
      return { ...state, loading: payload };
    },
  },
  effects: {
    async initView(currentTab, rootState) {
      const log = rootState.global.log;
      log.info('Initialized Velocity view');

      // We stop initializing if there are teams present
      if (rootState.velocity.teams.length > 0) {
        return true;
      }

      this.loadTeamsFromCache(currentTab);

      if (
        JSON.parse(window._env_.AUTH0_DISABLED) === true ||
        (JSON.parse(window._env_.AUTH0_DISABLED) !== true &&
          rootState.global.accessToken !== '')
      ) {
        log.info('Loading data');
        this.refreshTeams(currentTab);
      } else {
        log.info(
          'Not loading data, either there is already some data in cache or user token not present',
        );
      }
    },

    async loadTeamsFromCache(currentTab, rootState) {
      // If previous data was loaded and saved in localstorage
      // it will first display the cache, while the call to the backend is happening
      const cacheVelocityTeams = reactLocalStorage.getObject(
        'cache-velocityTeams',
      );
      if (Object.keys(cacheVelocityTeams).length > 0) {
        log.info(
          'Loading Teams data from cache while call to the backend is happening',
        );
        this.setTeams(reactLocalStorage.getObject('cache-velocityTeams'));
        const selectedTeam = cacheVelocityTeams.find(
          (t: any) => t.id === currentTab,
        );
        if (selectedTeam === undefined) {
          this.setSelectedTeam(cacheVelocityTeams[0].id);
        } else {
          this.setSelectedTeam(selectedTeam.id);
        }
      }
    },

    async loadVelocityFromCache(payload, rootState) {
      // If previous data was loaded and saved in localstorage
      // it will first display the cache, while the call to the backend is happening
      const cacheVelocity = reactLocalStorage.getObject('cache-velocity');
      if (Object.keys(cacheVelocity).length > 0) {
        log.info(
          'Loading Velocity data from cache while call to the backend is happening',
        );
        this.setVelocity(reactLocalStorage.getObject('cache-velocity'));
      }
    },

    async refreshTeams(currentTab, rootState) {
      const setTeams = this.setTeams;
      const setLoading = this.setLoading;
      const setSelectedTeam = this.setSelectedTeam;
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
        url: host + '/teams',
        headers,
      })
        .then(response => {
          setTeams(response.data);
          reactLocalStorage.setObject('cache-velocityTeams', response.data);
          // Set value to
          const selectedTeam =
            response.data.find((t: any) => t.id === currentTab) === undefined
              ? response.data[0].id
              : response.data.find((t: any) => t.id === currentTab).id;
          setSelectedTeam(selectedTeam);
          setLoading(false);
        })
        .catch(error => {
          setTeams([]);
          setSelectedTeam(null);
          setLoading(false);
        });
    },

    async fetchTeamData(teamId, rootState) {
      this.loadVelocityFromCache(teamId);
      const setVelocity = this.setVelocity;
      const setLoading = this.setLoading;
      if (
        rootState.velocity.teams.find((t: any) => t.id === teamId) !== undefined
      ) {
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
          .then(response => {
            const updatedVelocity = [
              ...rootState.velocity.velocity.filter(
                (t: any) => t.id !== teamId,
              ),
              response.data,
            ];
            setVelocity(updatedVelocity);
            reactLocalStorage.setObject('cache-velocity', updatedVelocity);
            setLoading(false);
          })
          .catch(error => {
            setLoading(false);
          });
      }
    },
  },
});
