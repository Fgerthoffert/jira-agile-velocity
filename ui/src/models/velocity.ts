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
    loading: false,
    selectedTeam: null
  },
  reducers: {
    setTeams(state: any, payload: any) {
      return { ...state, teams: payload };
    },
    setSelectedTeam(state: any, payload: any) {
      return { ...state, selectedTeam: payload };
    },
    setLoading(state: any, payload: any) {
      return { ...state, loading: payload };
    }
  },
  effects: {
    async initView(payload, rootState) {
      const log = rootState.global.log;
      log.info('Initialized Velocity view');
      // Fetch data
      const setTeams = this.setTeams;
      const setLoading = this.setLoading;
      const setSelectedTeam = this.setSelectedTeam;

      if (
        rootState.velocity.teams.length === 0 &&
        rootState.global.accessToken !== ''
      ) {
        log.info('Loading data');

        setLoading(true);
        const host =
          window._env_.API_URL !== undefined
            ? window._env_.API_URL
            : 'http://127.0.0.1:3001';
        const headers =
          window._env_.AUTH0_DISABLED !== true
            ? { Authorization: `Bearer ${rootState.global.accessToken}` }
            : {};
        axios({
          method: 'get',
          url: host + '/velocity',
          headers
        })
          .then(response => {
            setTeams(response.data);
            setSelectedTeam(response.data[0].team);
            setLoading(false);
          })
          .catch(error => {
            setTeams([]);
            setSelectedTeam(null);
            setLoading(false);
          });
      } else {
        log.info(
          'Not loading data, either there is already some data in cache or user token not present'
        );
      }
    }
  }
});
