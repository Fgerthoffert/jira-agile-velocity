// https://github.com/pimterry/loglevel
import * as log from 'loglevel';
import { createModel } from '@rematch/core';
import axios from 'axios';

import { fetchGraphIssues } from '../utils/graph';

declare global {
  interface Window {
    _env_: any;
  }
}

export const roadmap = createModel({
  state: {
    log: {},
    roadmap: {},
    selectedTab: 'completionchart',

    openGraph: false,
    graphInitiative: {},
    issuesGraph: [],
    maxIssuesGraph: 200,
    maxDistanceGraph: 5,
    maxDistanceGraphCeiling: 10,
    graphUpdateTimeoutId: {},
    graphUpdating: false,
    graphNodeSelected: {},
    graphNodeSelectedDialog: false,
    graphNode: {},
    graphPathStart: {},
    graphPathEnd: {}
  },
  reducers: {
    setLog(state: any, payload: any) {
      return { ...state, log: payload };
    },
    setRoadmap(state: any, payload: any) {
      return { ...state, roadmap: payload };
    },
    setOpenGraph(state: any, payload: any) {
      return { ...state, openGraph: payload };
    },
    setGraphInitiative(state: any, payload: any) {
      return { ...state, graphInitiative: JSON.parse(JSON.stringify(payload)) };
    },
    setSelectedTab(state: any, payload: any) {
      return { ...state, selectedTab: payload };
    },
    setIssuesGraph(state, payload) {
      return { ...state, issuesGraph: payload };
    },
    setGraphNode(state, payload) {
      return { ...state, graphNode: payload };
    },
    setGraphNodeSelected(state, payload) {
      return { ...state, graphNodeSelected: payload };
    },
    setGraphNodeSelectedDialog(state, payload) {
      return { ...state, graphNodeSelectedDialog: payload };
    },
    setMaxDistanceGraph(state, payload) {
      return { ...state, maxDistanceGraph: payload };
    },
    setMaxDistanceGraphCeiling(state, payload) {
      return { ...state, maxDistanceGraphCeiling: payload };
    },
    setGraphUpdateTimeoutId(state, payload) {
      return { ...state, graphUpdateTimeoutId: payload };
    },
    setGraphUpdating(state, payload) {
      return { ...state, graphUpdating: payload };
    },
    setGraphPathStart(state, payload) {
      return { ...state, graphPathStart: payload };
    },
    setGraphPathEnd(state, payload) {
      return { ...state, graphPathEnd: payload };
    }
  },
  effects: {
    async initView(payload, rootState) {
      const logger = log.noConflict();
      if (process.env.NODE_ENV !== 'production') {
        logger.enableAll();
      } else {
        logger.disableAll();
      }
      logger.info('Logger initialized');
      this.setLog(logger);

      // Fetch data
      const setRoadmap = this.setRoadmap;

      if (Object.values(rootState.roadmap.roadmap).length === 0) {
        const host =
          window._env_.API_URL !== undefined
            ? window._env_.API_URL
            : 'http://127.0.0.1:3001';
        axios({
          method: 'get',
          url: host + '/roadmap'
        })
          .then(response => {
            setRoadmap(response.data);
          })
          .catch(error => {
            setRoadmap({});
          });
      }
    },
    async updateGraph(payload, rootState) {
      const log = rootState.roadmap.log;
      let t0 = performance.now();

      const sourceIssues = fetchGraphIssues(rootState.roadmap.graphInitiative);
      let highestDistance = 10;
      if (sourceIssues.length > 0) {
        highestDistance = sourceIssues
          .map(i => i.data.distance)
          .reduce((a, b) => Math.max(a, b));
      }
      this.setMaxDistanceGraphCeiling(highestDistance);

      if (rootState.roadmap.maxDistanceGraph > highestDistance) {
        this.setMaxDistanceGraph(highestDistance);
      }

      // Filter based on current max distance
      let maxDistance = rootState.roadmap.maxDistanceGraph;
      if (maxDistance > highestDistance) {
        maxDistance = highestDistance;
      }
      const filteredIssue = sourceIssues.filter(
        i => i.data.distance <= maxDistance
      );
      this.initGraphData(filteredIssue);
      var t1 = performance.now();

      this.setGraphUpdating(false);
      log.info('updateGraph - took ' + (t1 - t0) + ' milliseconds.');
    },

    async initGraphData(graphIssues, rootState) {
      const graphData = [...graphIssues];
      // append the edges to the initiative

      for (let child of rootState.roadmap.graphInitiative.children) {
        graphData.push({
          data: {
            group: 'edges',
            source: child.id,
            target: rootState.roadmap.graphInitiative.id
          }
        });

        if (child.children !== undefined && child.children.length > 0) {
          for (let childl1 of child.children) {
            graphData.push({
              data: {
                group: 'edges',
                source: childl1.id,
                target: child.id
              }
            });
            if (childl1.children !== undefined && childl1.children.length > 0) {
              for (let childl2 of childl1.children) {
                graphData.push({
                  data: {
                    group: 'edges',
                    source: childl2.id,
                    target: childl1.id
                  }
                });
              }
            }
          }
        }
      }
      this.setIssuesGraph(graphData);
    }
  }
});
