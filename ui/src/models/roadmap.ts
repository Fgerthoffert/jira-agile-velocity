// https://github.com/pimterry/loglevel
import * as log from 'loglevel';
import { createModel } from '@rematch/core';
import axios from 'axios';
import { reactLocalStorage } from 'reactjs-localstorage';
import * as lzstring from 'lz-string';

import { fetchGraphIssues } from '../utils/graph';

declare global {
  interface Window {
    _env_: any;
  }
}

export const roadmap = createModel({
  state: {
    log: {},
    loading: false,
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
    graphPathEnd: {},
    showDeleteModal: false,
    deleteModalCacheDays: [],

    initiativeHistory: false,
  },
  reducers: {
    setLog(state: any, payload: any) {
      return { ...state, log: payload };
    },
    setRoadmap(state: any, payload: any) {
      return { ...state, roadmap: payload };
    },
    setLoading(state: any, payload: any) {
      return { ...state, loading: payload };
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
    async initView() {
      const logger = log.noConflict();
      if (process.env.NODE_ENV !== 'production') {
        logger.enableAll();
      } else {
        logger.disableAll();
      }
      logger.info('Roadmap Logger initialized');
      this.setLog(logger);
      this.loadDataFromCache();
      this.loadData();
    },

    async loadDataFromCache() {
      // If previous data was loaded and saved in localstorage
      // it will first display the cache, while the call to the backend is happening
      const cacheRoadmapLz = reactLocalStorage.getObject('cache-roadmap');
      if (cacheRoadmapLz !== null && Object.keys(cacheRoadmapLz).length > 0) {
        const cacheRoadmapStr: any = lzstring.decompress(cacheRoadmapLz)
        const cacheRoadmap: any = JSON.parse(cacheRoadmapStr);
        if (Object.keys(cacheRoadmap).length > 0) {
          log.info(
            'Loading Roadmap data from cache while call to the backend is happening',
          );
          this.setRoadmap(cacheRoadmap);
        }        
      }
    },

    async loadData(roadmap, rootState) {
      // Fetch data
      const setRoadmap = this.setRoadmap;
      const augmentRoadmap = this.augmentRoadmap;
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
            : {};
        axios({
          method: 'get',
          url: host + '/initiatives',
          headers,
        })
          .then(response => {
            augmentRoadmap(response.data);
            setLoading(false);
          })
          .catch(error => {
            console.log(error);
            setRoadmap({});
            setLoading(false);
          });
      } else {
        log.info(
          'Not loading data, either there is already some data in cache or user token not present',
        );
      }
    },

    async clearCacheDay(cacheDay, rootState) {
      // Fetch data
      const setDeleteModalCacheDays = this.setDeleteModalCacheDays;
      const deleteModalRefreshCacheDays = this.deleteModalRefreshCacheDays;
      const setLoading = this.setLoading;
      console.log(cacheDay);

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
            : {};
        axios({
          method: 'delete',
          url: host + '/cachedays/' + cacheDay,
          headers,
        })
          .then(response => {
            setDeleteModalCacheDays(response.data);
            setLoading(false);
          })
          .catch(error => {
            console.log(error);
            setLoading(false);
            deleteModalRefreshCacheDays();
          });
      } else {
        log.info(
          'Not loading data, either there is already some data in cache or user token not present',
        );
      }
    },

    async deleteModalRefreshCacheDays(roadmap, rootState) {
      // Fetch data
      const setDeleteModalCacheDays = this.setDeleteModalCacheDays;
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
            : {};
        axios({
          method: 'get',
          url: host + '/cachedays',
          headers,
        })
          .then(response => {
            setDeleteModalCacheDays(response.data);
            setLoading(false);
          })
          .catch(error => {
            console.log(error);
            setDeleteModalCacheDays([]);
            setLoading(false);
          });
      } else {
        log.info(
          'Not loading data, either there is already some data in cache or user token not present',
        );
      }
    },

    // Adds empty weeks to the payload
    // Basically it add to the array, empty roadmap days
    async augmentRoadmap(roadmap) {
      const augmentedRoadmap = {
        ...roadmap,
        initiatives: roadmap.initiatives.map((i: any) => {
          return {
            ...i,
            weeks: roadmap.calendar.completed.map((w: any) => {
              const initiativeWeek = i.weeks.find(
                (iw: any) => iw.weekStart === w.weekStart,
              );
              if (initiativeWeek !== undefined) {
                return initiativeWeek;
              }
              return w;
            }),
          };
        }),
        futureCompletion: roadmap.futureCompletion.map((i: any) => {
          return {
            ...i,
            weeks: roadmap.calendar.roadmap.map((w: any) => {
              const roadmapWeek = i.weeks.find(
                (iw: any) => iw.weekStart === w.weekStart,
              );
              if (roadmapWeek !== undefined) {
                return roadmapWeek;
              }
              return w;
            }),
          };
        }),
      };
      reactLocalStorage.setObject('cache-roadmap', lzstring.compress(JSON.stringify(augmentedRoadmap)));
      this.setRoadmap(augmentedRoadmap);
    },

    async updateGraph(payload, rootState) {
      const logsvc = rootState.roadmap.log;
      const t0 = performance.now();

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
        i => i.data.distance <= maxDistance,
      );
      this.initGraphData(filteredIssue);
      const t1 = performance.now();

      this.setGraphUpdating(false);
      logsvc.info('updateGraph - took ' + (t1 - t0) + ' milliseconds.');
    },

    async initGraphData(graphIssues, rootState) {
      const graphData = [...graphIssues];
      // append the edges to the initiative

      for (const child of rootState.roadmap.graphInitiative.children) {
        graphData.push({
          data: {
            group: 'edges',
            source: child.id,
            target: rootState.roadmap.graphInitiative.id,
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
    async initHistory(initiativeKey) {
      const logger = log.noConflict();
      if (process.env.NODE_ENV !== 'production') {
        logger.enableAll();
      } else {
        logger.disableAll();
      }
      logger.info('Roadmap Logger initialized');
      this.setLog(logger);
      this.loadHistoryData(initiativeKey);
    },
    async loadHistoryData(initiativeKey, rootState) {
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
            : {};
        axios({
          method: 'get',
          url: host + '/history/' + initiativeKey,
          headers,
        })
          .then(response => {
            setInitiativeHistory(response.data);
            setLoading(false);
          })
          .catch(error => {
            console.log(error);
            setInitiativeHistory(false);
            setLoading(false);
          });
      } else {
        log.info(
          'Not loading data, either there is already some data in cache or user token not present',
        );
      }
    },
  },
});
