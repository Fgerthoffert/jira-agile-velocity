/* eslint-disable @typescript-eslint/no-explicit-any */
import * as log from 'loglevel';
import axios from 'axios';
import { startOfMonth, sub } from 'date-fns';
import { min, max, quantile } from 'simple-statistics';

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

const getMonthsBetweenDates = (startMonth: Date, endMonth: Date) => {
  const months: Array<Date> = [];
  const currentDate = startMonth;
  while (currentDate <= endMonth) {
    if (
      !months
        .map((m) => m.getTime())
        .includes(startOfMonth(new Date(currentDate)).getTime())
    ) {
      months.push(startOfMonth(new Date(currentDate)));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return months;
};

export const generateReleaseMonthsWithMovingAverage = (
  monthsToChart: number,
  rollingWindow: number,
  versions: any,
) => {
  const chartStartDate = sub(new Date(), { months: monthsToChart });
  const filteredVersions = versions.filter(
    (v: any) => new Date(v.releaseDate).getTime() > chartStartDate.getTime(),
  );

  // Look for the first and last month
  let startMonth = new Date();
  for (const v of filteredVersions) {
    if (new Date(v.releaseDate) < startMonth) {
      startMonth = startOfMonth(new Date(v.releaseDate));
    }
  }
  const months = getMonthsBetweenDates(startMonth, startOfMonth(new Date()));

  // Create a array of issues delivered for each month
  const monthsWithIssues = months.reduce((acc: Array<any>, m: Date) => {
    const releases = filteredVersions.filter(
      (v: any) =>
        m.getTime() === startOfMonth(new Date(v.releaseDate)).getTime(),
    );
    const issues = [];
    for (const r of releases) {
      for (const i of r.issues) {
        issues.push({ ...i, release: r });
      }
    }
    acc.push({
      monthStart: m,
      issues: issues,
    });
    return acc;
  }, []);

  // Create rolling average array
  const monthsMovingAverage = monthsWithIssues.reduce(
    (acc: Array<any>, month: any, idx: number) => {
      const movingIssues: Array<any> = [];
      // Push issues for the current month
      for (let i = 0; i < rollingWindow; i++) {
        if (idx - i >= 0) {
          movingIssues.push(...monthsWithIssues[idx - i].issues);
        }
      }
      const stats: any = {
        rolling: {
          monthsToRelease: {
            datapoints: movingIssues
              .filter(
                (i) => i.daysToRelease >= 0 && i.monthsToRelease !== undefined,
              ) // Filter negatives numbers (if any)
              .map((i) => i.monthsToRelease),
            quantiles: {
              min: { value: 'N/A', issues: [] },
              max: { value: 'N/A', issues: [] },
              25: { value: 'N/A', issues: [] },
              50: { value: 'N/A', issues: [] },
              75: { value: 'N/A', issues: [] },
              90: { value: 'N/A', issues: [] },
              95: { value: 'N/A', issues: [] },
            },
          },
        },
        current: {
          monthsToRelease: {
            datapoints: month.issues
              .filter(
                (i: any) =>
                  i.daysToRelease >= 0 && i.monthsToRelease !== undefined,
              ) // Filter negatives numbers (if any)
              .map((i: any) => i.monthsToRelease),
            quantiles: {
              min: { value: 'N/A', issues: [] },
              max: { value: 'N/A', issues: [] },
              25: { value: 'N/A', issues: [] },
              50: { value: 'N/A', issues: [] },
              75: { value: 'N/A', issues: [] },
              90: { value: 'N/A', issues: [] },
              95: { value: 'N/A', issues: [] },
            },
          },
        },
      };
      if (stats.rolling.monthsToRelease.datapoints.length > 0) {
        stats.rolling.monthsToRelease.quantiles.min.value = min(
          stats.rolling.monthsToRelease.datapoints,
        );
        stats.rolling.monthsToRelease.quantiles.max.value = max(
          stats.rolling.monthsToRelease.datapoints,
        );
        stats.rolling.monthsToRelease.quantiles[25].value = quantile(
          stats.rolling.monthsToRelease.datapoints,
          0.25,
        );
        stats.rolling.monthsToRelease.quantiles[50].value = quantile(
          stats.rolling.monthsToRelease.datapoints,
          0.5,
        );
        stats.rolling.monthsToRelease.quantiles[75].value = quantile(
          stats.rolling.monthsToRelease.datapoints,
          0.75,
        );
        stats.rolling.monthsToRelease.quantiles[90].value = quantile(
          stats.rolling.monthsToRelease.datapoints,
          0.9,
        );
        stats.rolling.monthsToRelease.quantiles[95].value = quantile(
          stats.rolling.monthsToRelease.datapoints,
          0.95,
        );
        stats.rolling.monthsToRelease.quantiles.min.issues =
          movingIssues.filter(
            (i) =>
              i.monthsToRelease ===
              stats.rolling.monthsToRelease.quantiles.min.value,
          );
        stats.rolling.monthsToRelease.quantiles.max.issues =
          movingIssues.filter(
            (i) =>
              i.monthsToRelease ===
              stats.rolling.monthsToRelease.quantiles.max.value,
          );
      }
      if (stats.current.monthsToRelease.datapoints.length > 0) {
        stats.current.monthsToRelease.quantiles.min.value = min(
          stats.current.monthsToRelease.datapoints,
        );
        stats.current.monthsToRelease.quantiles.max.value = max(
          stats.current.monthsToRelease.datapoints,
        );
        stats.current.monthsToRelease.quantiles[25].value = quantile(
          stats.current.monthsToRelease.datapoints,
          0.25,
        );
        stats.current.monthsToRelease.quantiles[50].value = quantile(
          stats.current.monthsToRelease.datapoints,
          0.5,
        );
        stats.current.monthsToRelease.quantiles[75].value = quantile(
          stats.current.monthsToRelease.datapoints,
          0.75,
        );
        stats.current.monthsToRelease.quantiles[90].value = quantile(
          stats.current.monthsToRelease.datapoints,
          0.9,
        );
        stats.current.monthsToRelease.quantiles[95].value = quantile(
          stats.current.monthsToRelease.datapoints,
          0.95,
        );
        stats.current.monthsToRelease.quantiles.min.issues =
          month.issues.filter(
            (i: any) =>
              i.monthsToRelease ===
              stats.current.monthsToRelease.quantiles.min.value,
          );
        stats.current.monthsToRelease.quantiles.max.issues =
          month.issues.filter(
            (i: any) =>
              i.monthsToRelease ===
              stats.current.monthsToRelease.quantiles.max.value,
          );
        stats.current.monthsToRelease.quantiles[25].issues =
          month.issues.filter(
            (i: any) =>
              i.monthsToRelease <=
              stats.current.monthsToRelease.quantiles[25].value,
          );
        stats.current.monthsToRelease.quantiles[50].issues =
          month.issues.filter(
            (i: any) =>
              i.monthsToRelease <=
              stats.current.monthsToRelease.quantiles[50].value,
          );
        stats.current.monthsToRelease.quantiles[75].issues =
          month.issues.filter(
            (i: any) =>
              i.monthsToRelease <=
              stats.current.monthsToRelease.quantiles[75].value,
          );
        stats.current.monthsToRelease.quantiles[90].issues =
          month.issues.filter(
            (i: any) =>
              i.monthsToRelease <=
              stats.current.monthsToRelease.quantiles[90].value,
          );
        stats.current.monthsToRelease.quantiles[95].issues =
          month.issues.filter(
            (i: any) =>
              i.monthsToRelease <=
              stats.current.monthsToRelease.quantiles[95].value,
          );
      }
      acc.push({
        ...month,
        movingIssues: movingIssues,
        stats: stats,
      });
      return acc;
    },
    [],
  );
  return monthsMovingAverage;
};

export const versions: Versions = {
  state: {
    loading: false,
    rawVersions: [],
    versions: [],
    monthsReleases: [],
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
    setMonthsReleases(state: any, payload: any) {
      return { ...state, monthsReleases: payload };
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
      const setMonthsReleases = this.setMonthsReleases;

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
      const monthsWithMovingAverage = generateReleaseMonthsWithMovingAverage(
        rootState.versions.monthsToChart,
        rootState.versions.rollingWindow,
        filterEmptyVersions,
      );
      console.log(
        '[Versions]: MTTR generated for the versions are: ',
        monthsWithMovingAverage,
      );
      setMonthsReleases(monthsWithMovingAverage);
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
