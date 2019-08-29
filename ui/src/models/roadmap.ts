import { createModel } from "@rematch/core";
import axios from "axios";

export const roadmap = createModel({
  state: {
    roadmap: {}
  },
  reducers: {
    setRoadmap(state: any, payload: any) {
      return { ...state, roadmap: payload };
    }
  },
  effects: {
    async initView(payload, rootState) {
      console.log("Init View");
      // Fetch data
      const setRoadmap = this.setRoadmap;

      if (Object.values(rootState.roadmap.roadmap).length === 0) {
        axios({
          method: "get",
          url: "http://127.0.0.1:3001/roadmap"
        })
          .then(function(response) {
            setRoadmap(response.data);
          })
          .catch(function(error) {
            console.log("Error");
          });
      }
    }
  }
});
