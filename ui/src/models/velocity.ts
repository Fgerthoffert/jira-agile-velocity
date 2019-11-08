import { createModel } from '@rematch/core';
import axios from 'axios';

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
          // Set value to
          const selectedTeam = response.data.find(
            (t: any) => t.id === currentTab,
          );
          if (selectedTeam === undefined) {
            setSelectedTeam(response.data[0].id);
          } else {
            setSelectedTeam(selectedTeam.id);
          }
          setLoading(false);
        })
        .catch(error => {
          setTeams([]);
          setSelectedTeam(null);
          setLoading(false);
        });
    },

    async fetchTeamData(teamId, rootState) {
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
            setVelocity([...rootState.velocity.velocity, response.data]);
            setLoading(false);
          })
          .catch(error => {
            setLoading(false);
          });
      }
    },
  },
});
