/* eslint-disable @typescript-eslint/no-explicit-any */
import * as log from 'loglevel';
import axios from 'axios';

// import { CompletionStream, CompletionDay, JiraIssue } from '../global';

declare global {
  interface Window {
    _env_: any;
  }
}

interface Versions {
  state: any;
  reducers: any;
  effects: any;
}

export const getId = (inputstring: string) => {
  return String(inputstring)
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};

export const processRestPayload = (payload: any, callback: any) => {
  const coreData = {
    updatedAt: payload.updatedAt,
    filterName:
      payload.defaultFilters.name === undefined
        ? ''
        : payload.defaultFilters.name,
    filterLabel:
      payload.defaultFilters.label === undefined
        ? ''
        : payload.defaultFilters.label,
    filterProjectKey:
      payload.defaultFilters.projectKey === undefined
        ? ''
        : payload.defaultFilters.projectKey,
    filterIssueType:
      payload.defaultFilters.issueType === undefined
        ? ''
        : payload.defaultFilters.issueType,
    filterPriority:
      payload.defaultFilters.priority === undefined
        ? ''
        : payload.defaultFilters.priority,
    monthsToChart: payload.monthsToChart,
    versions: payload.versions,
    jiraHost: payload.jiraHost,
  };
  callback(coreData);
};

export const versions: Versions = {
  state: {
    loading: false,
    rawVersions: [],
    versions: [],
    filterName: '',
    filterLabel: '',
    filterProjectKey: '',
    filterIssueType: '',
    filterPriority: '',
    updatedAt: null,
    monthsToChart: null,
    rollingWindow: 3,

    jiraHost: null,

    showIssuesModal: false,
    issuesModalIssues: [],
    issuesModalTitle: '',
  },
  reducers: {
    setVersions(state: any, payload: any) {
      return { ...state, versions: payload };
    },
    setRawVersions(state: any, payload: any) {
      return { ...state, rawVersions: payload };
    },
    setCoreData(state: any, payload: any) {
      return {
        ...state,
        rawVersions: payload.versions,
        versions: payload.versions,
        updatedAt: payload.updatedAt,
        filterName: payload.filterName,
        filterLabel: payload.filterLabel,
        filterProjectKey: payload.filterProjectKey,
        filterIssueType: payload.filterIssueType,
        filterPriority: payload.filterPriority,
        monthsToChart: payload.monthsToChart,
        jiraHost: payload.jiraHost,
      };
    },
    setMonthsToChart(state: any, payload: any) {
      return { ...state, monthsToChart: payload };
    },
    setFilterName(state: any, payload: any) {
      return { ...state, filterName: payload };
    },
    setFilterProjectKey(state: any, payload: any) {
      return { ...state, filterProjectKey: payload };
    },
    setFilterLabel(state: any, payload: any) {
      return { ...state, filterLabel: payload };
    },
    setFilterPriority(state: any, payload: any) {
      return { ...state, filterPriority: payload };
    },
    setFilterIssueType(state: any, payload: any) {
      return { ...state, filterIssueType: payload };
    },
    setRollingWindow(state: any, payload: any) {
      return { ...state, rollingWindow: payload };
    },
    setLoading(state: any, payload: any) {
      return { ...state, loading: payload };
    },
    setJiraHost(state: any, payload: any) {
      return { ...state, jiraHost: payload };
    },
    setShowIssuesModal(state: any, payload: any) {
      return { ...state, showIssuesModal: payload };
    },
    setIssuesModalIssues(state: any, payload: any) {
      return { ...state, issuesModalIssues: payload };
    },
    setIssuesModalTitle(state: any, payload: any) {
      return { ...state, issuesModalTitle: payload };
    },
  },
  effects: {
    async initView(versionObj: any, rootState: any) {
      const logger = log.noConflict();
      if (process.env.NODE_ENV !== 'production') {
        logger.enableAll();
      } else {
        logger.disableAll();
      }

      if (
        JSON.parse(window._env_.AUTH0_DISABLED) === true ||
        (JSON.parse(window._env_.AUTH0_DISABLED) !== true &&
          rootState.global.accessToken !== '')
      ) {
        logger.info('Loading data');
        this.fetchVersionData();
      } else {
        logger.info(
          'Not loading data, either there is already some data in cache or user token not (yet) present',
        );
      }
    },

    async refreshFilters(versionObj: any, rootState: any) {
      const logger = log.noConflict();
      if (process.env.NODE_ENV !== 'production') {
        logger.enableAll();
      } else {
        logger.disableAll();
      }
      const setVersions = this.setVersions;
      logger.info('Refreshing filters');
      // Filters are applied in this order: Release Name, Project, Label

      const rawVersions = rootState.versions.rawVersions;

      const nameFiltered =
        rootState.versions.filterName === ''
          ? rawVersions
          : rawVersions.filter((v: any) =>
              getId(v.name).includes(getId(rootState.versions.filterName)),
            );

      const typeFiltered =
        rootState.versions.filterIssueType === ''
          ? nameFiltered
          : nameFiltered.filter((v: any) =>
              getId(v.type).includes(getId(rootState.versions.filterIssueType)),
            );

      const priorityFiltered =
        rootState.versions.filterPriority === ''
          ? typeFiltered
          : typeFiltered.reduce((acc: Array<any>, v: any) => {
              const updatedVersion = {
                ...v,
                issues: v.issues.filter((i: any) =>
                  getId(i.priority).includes(
                    getId(rootState.versions.filterPriority),
                  ),
                ),
              };
              acc.push(updatedVersion);
              return acc;
            }, []);

      const projectFiltered =
        rootState.versions.filterProjectKey === ''
          ? priorityFiltered
          : priorityFiltered.reduce((acc: Array<any>, v: any) => {
              const updatedVersion = {
                ...v,
                issues: v.issues.filter((i: any) =>
                  getId(i.projectKey).includes(
                    getId(rootState.versions.filterProjectKey),
                  ),
                ),
              };
              acc.push(updatedVersion);
              return acc;
            }, []);

      const labelFiltered =
        rootState.versions.filterLabel === ''
          ? projectFiltered
          : projectFiltered.reduce((acc: Array<any>, v: any) => {
              const updatedVersion = {
                ...v,
                issues: v.issues.filter((i: any) => {
                  for (const label of i.labels) {
                    if (
                      getId(label).includes(
                        getId(rootState.versions.filterLabel),
                      )
                    ) {
                      return true;
                    }
                  }
                  return false;
                }),
              };
              acc.push(updatedVersion);
              return acc;
            }, []);

      const filterEmptyVersions = labelFiltered.filter(
        (v: any) => v.issues.length > 0,
      );

      console.log(
        '[Versions]: Versions resulting of the filters are: ',
        labelFiltered,
      );
      setVersions(filterEmptyVersions);
    },

    async fetchVersionData(versionId: any, rootState: any) {
      if (rootState.versions.loading === false) {
        const setCoreData = this.setCoreData;
        const setLoading = this.setLoading;
        const refreshFilters = this.refreshFilters;

        if (versionId !== null) {
          console.log(
            '[Versions] Fetching completion data for version: ' + versionId,
          );

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
            url: host + '/versions/',
            headers,
          })
            .then((response) => {
              console.log(
                '[Versions] Data received from backend for ' +
                  response.data.versions.length +
                  ' versions',
              );

              processRestPayload(response.data, setCoreData);
              setLoading(false);

              setTimeout(() => {
                refreshFilters();
              }, 2000);
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
