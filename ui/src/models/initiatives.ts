/* eslint-disable @typescript-eslint/no-explicit-any */
import * as log from 'loglevel';
import axios from 'axios';
import { fetchGraphIssues } from '../utils/graph';

declare global {
  interface Window {
    _env_: any;
  }
}

interface Initiatives {
  state: any;
  reducers: any;
  effects: any;
}

export const initiatives: Initiatives = {
  state: {
    log: {},
    loading: false,
    jiraHost: null,

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
    graphPathEnd: {},
    showDeleteModal: false,
    deleteModalCacheDays: [],
    initiativeHistory: [],
  },
  reducers: {
    setLog(state: any, payload: any) {
      return { ...state, log: payload };
    },
    setLoading(state: any, payload: any) {
      return { ...state, loading: payload };
    },
    setJiraHost(state: any, payload: any) {
      return { ...state, jiraHost: payload };
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
    setIssuesGraph(state: any, payload: any) {
      return { ...state, issuesGraph: payload };
    },
    setGraphNode(state: any, payload: any) {
      return { ...state, graphNode: payload };
    },
    setGraphNodeSelected(state: any, payload: any) {
      return { ...state, graphNodeSelected: payload };
    },
    setGraphNodeSelectedDialog(state: any, payload: any) {
      return { ...state, graphNodeSelectedDialog: payload };
    },
    setMaxDistanceGraph(state: any, payload: any) {
      return { ...state, maxDistanceGraph: payload };
    },
    setMaxDistanceGraphCeiling(state: any, payload: any) {
      return { ...state, maxDistanceGraphCeiling: payload };
    },
    setGraphUpdateTimeoutId(state: any, payload: any) {
      return { ...state, graphUpdateTimeoutId: payload };
    },
    setGraphUpdating(state: any, payload: any) {
      return { ...state, graphUpdating: payload };
    },
    setGraphPathStart(state: any, payload: any) {
      return { ...state, graphPathStart: payload };
    },
    setGraphPathEnd(state: any, payload: any) {
      return { ...state, graphPathEnd: payload };
    },
    setShowDeleteModal(state: any, payload: any) {
      return { ...state, showDeleteModal: payload };
    },
    setDeleteModalCacheDays(state: any, payload: any) {
      return { ...state, deleteModalCacheDays: payload };
    },
    setInitiativeHistory(state: any, payload: any) {
      return { ...state, initiativeHistory: payload };
    },
  },
  effects: {
    async updateGraph(payload: any, rootState: any) {
      const t0 = performance.now();

      const sourceIssues = fetchGraphIssues(
        rootState.initiatives.graphInitiative,
      );
      let highestDistance = 10;
      if (sourceIssues.length > 0) {
        highestDistance = sourceIssues
          .map((i) => i.data.distance)
          .reduce((a, b) => Math.max(a, b));
      }
      this.setMaxDistanceGraphCeiling(highestDistance);

      if (rootState.initiatives.maxDistanceGraph > highestDistance) {
        this.setMaxDistanceGraph(highestDistance);
      }

      // Filter based on current max distance
      let maxDistance = rootState.initiatives.maxDistanceGraph;
      if (maxDistance > highestDistance) {
        maxDistance = highestDistance;
      }
      const filteredIssue = sourceIssues.filter(
        (i) => i.data.distance <= maxDistance,
      );
      this.initGraphData(filteredIssue);
      const t1 = performance.now();

      this.setGraphUpdating(false);
      console.log(
        '[Initiatives] updateGraph - took ' + (t1 - t0) + ' milliseconds.',
      );
    },

    async initGraphData(graphIssues: any, rootState: any) {
      const graphData = [...graphIssues];
      // append the edges to the initiative

      for (const child of rootState.initiatives.graphInitiative.children) {
        graphData.push({
          data: {
            group: 'edges',
            source: child.id,
            target: rootState.initiatives.graphInitiative.id,
          },
        });

        if (child.children !== undefined && child.children.length > 0) {
          for (const childl1 of child.children) {
            graphData.push({
              data: {
                group: 'edges',
                source: childl1.id,
                target: child.id,
              },
            });
            if (childl1.children !== undefined && childl1.children.length > 0) {
              for (const childl2 of childl1.children) {
                graphData.push({
                  data: {
                    group: 'edges',
                    source: childl2.id,
                    target: childl1.id,
                  },
                });
              }
            }
          }
        }
      }
      this.setIssuesGraph(graphData);
    },

    async initHistory(initiativeKey: any) {
      const logger = log.noConflict();
      if (process.env.NODE_ENV !== 'production') {
        logger.enableAll();
      } else {
        logger.disableAll();
      }
      logger.info('Initiative Logger initialized for key: ' + initiativeKey);
      this.setLog(logger);
      this.loadHistoryData(initiativeKey);
    },

    async loadHistoryData(initiativeKey: any, rootState: any) {
      // Fetch data
      const setInitiativeHistory = this.setInitiativeHistory;
      const setLoading = this.setLoading;

      if (
        JSON.parse(window._env_.AUTH0_DISABLED) === true ||
        (JSON.parse(window._env_.AUTH0_DISABLED) !== true &&
          rootState.global.accessToken !== '')
      ) {
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
          url: `${host}/history/${rootState.teams.selectedTeamId}/${initiativeKey}`,
          headers,
        })
          .then((response) => {
            setInitiativeHistory(response.data);
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setInitiativeHistory(false);
            setLoading(false);
          });
      } else {
        console.log(
          '[Initiatives] Not loading data, either there is already some data in cache or user token not present',
        );
      }
    },
  },
};
