import { createModel } from "@rematch/core";
import axios from "axios";

export const velocity = createModel({
  state: {
    teams: []
  },
  reducers: {
    setTeams(state: any, payload: any) {
      return { ...state, teams: payload };
    }
  },
  effects: {
    async initView(payload, rootState) {
      console.log("Init View");
      // Fetch data
      const setTeams = this.setTeams;

      if (rootState.velocity.teams.length === 0) {
        axios({
          method: "get",
          url: "http://127.0.0.1:3001/velocity"
        })
          .then(function(response) {
            setTeams(response.data);
          })
          .catch(function(error) {
            console.log("Error");
          });
      }
    }
  }
});
