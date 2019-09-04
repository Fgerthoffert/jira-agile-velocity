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
    selectedTeam: null
  },
  reducers: {
    setTeams(state: any, payload: any) {
      return { ...state, teams: payload };
    },
    setSelectedTeam(state: any, payload: any) {
      return { ...state, selectedTeam: payload };
    }
  },
  effects: {
    async initView(payload, rootState) {
      // Fetch data
      const setTeams = this.setTeams;
      const setSelectedTeam = this.setSelectedTeam;

      if (rootState.velocity.teams.length === 0) {
        const host =
          window._env_.API_URL !== undefined
            ? window._env_.API_URL
            : 'http://127.0.0.1:3001';
        axios({
          method: 'get',
          url: host + '/velocity'
        })
          .then(response => {
            setTeams(response.data);
            setSelectedTeam(response.data[0].team);
          })
          .catch(error => {
            setTeams([]);
            setSelectedTeam(null);
          });
      }
    }
  }
});
