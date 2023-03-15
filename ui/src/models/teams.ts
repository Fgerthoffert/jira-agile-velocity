/* eslint-disable @typescript-eslint/no-explicit-any */
import * as log from 'loglevel';
import axios from 'axios';
import { reactLocalStorage } from 'reactjs-localstorage';

import {
  CompletionData,
  CompletionStream,
  CompletionDay,
  JiraIssue,
} from '../global';

import { startOfWeek, add, isEqual, differenceInWeeks, sub } from 'date-fns';

declare global {
  interface Window {
    _env_: any;
  }
}

interface Teams {
  state: any;
  reducers: any;
  effects: any;
}

interface CompletionWeek {
  firstDay: Date;
  issues: Array<JiraIssue>;
  metrics: {
    issues: {
      count: number;
      velocity: number;
    };
    points: {
      count: number;
      velocity: number;
    };
  };
}

// Build an empty calendar of weeks
export const getEmptyCalendar = (from: Date, to: Date) => {
  let dateCursor = startOfWeek(from);
  const weeks: Array<CompletionWeek> = [];
  while (dateCursor < to) {
    weeks.push({
      firstDay: dateCursor,
      issues: [],
      metrics: {
        issues: {
          count: 0,
          velocity: 0,
        },
        points: {
          count: 0,
          velocity: 0,
        },
      },
    });
    dateCursor = add(dateCursor, { days: 7 });
  }
  return weeks;
};

// From completion data, format the streams with the actual velocity
export const getCompletionStreams = (completionData: CompletionData) => {
  console.log('[Teams] Calculating Teams completion streams');
  const velocityWeeks = 4;
  const emptyCalendar = getEmptyCalendar(
    new Date(completionData.from),
    new Date(),
  );
  return completionData.completion.map((s: CompletionStream) => {
    const issues = s.issues.map((i) => {
      const days = s.days.map((d) => {
        return {
          day: d.day,
          issues: d.issues.filter((di) => i.issues.includes(di.key)),
        };
      });
      const emptyCalendarSub = getEmptyCalendar(
        sub(new Date(), { months: 3 }),
        new Date(),
      );
      return {
        ...i,
        weeks: emptyCalendarSub.map((w: CompletionWeek) => {
          const completedDays = days.filter((d: CompletionDay) =>
            isEqual(startOfWeek(new Date(d.day)), w.firstDay),
          );
          const completedIssues = completedDays.reduce(
            (acc: Array<JiraIssue>, day: CompletionDay) => {
              return [...acc, ...day.issues];
            },
            [],
          );

          // Gather data for velocity window
          const velocityDays = s.days.filter(
            (d: CompletionDay) =>
              new Date(d.day) < w.firstDay &&
              differenceInWeeks(w.firstDay, startOfWeek(new Date(d.day))) <=
                velocityWeeks,
          );
          const velocityIssues = velocityDays.reduce(
            (acc: Array<JiraIssue>, day: CompletionDay) => {
              return [...acc, ...day.issues];
            },
            [],
          );
          return {
            ...w,
            issues: completedIssues,
            completed: {
              days: completedDays,
              issues: completedIssues,
            },
            velocity: {
              days: velocityDays,
              issues: velocityIssues,
            },
            metrics: {
              issues: {
                count: completedIssues.length,
                velocity: velocityIssues.length / velocityWeeks,
              },
              points: {
                count: completedIssues
                  .map((j: JiraIssue) => j.points)
                  .reduce((acc: number, value: number) => acc + value, 0),
                velocity:
                  velocityIssues
                    .map((j: JiraIssue) => j.points)
                    .reduce((acc: number, value: number) => acc + value, 0) /
                  velocityWeeks,
              },
            },
          };
        }),
      };
    });

    return {
      ...s,
      issues,
      days: s.days.map((d) => {
        return { ...d, day: new Date(d.day) };
      }),
      weeks: emptyCalendar.map((w: CompletionWeek) => {
        // Filter by days completed during that week
        const completedDays = s.days.filter((d: CompletionDay) =>
          isEqual(startOfWeek(new Date(d.day)), w.firstDay),
        );
        const completedIssues = completedDays.reduce(
          (acc: Array<JiraIssue>, day: CompletionDay) => {
            return [...acc, ...day.issues];
          },
          [],
        );

        // Gather data for velocity window
        const velocityDays = s.days.filter(
          (d: CompletionDay) =>
            new Date(d.day) < w.firstDay &&
            differenceInWeeks(w.firstDay, startOfWeek(new Date(d.day))) <=
              velocityWeeks,
        );
        const velocityIssues = velocityDays.reduce(
          (acc: Array<JiraIssue>, day: CompletionDay) => {
            return [...acc, ...day.issues];
          },
          [],
        );
        return {
          ...w,
          completed: {
            days: completedDays,
            issues: completedIssues,
          },
          velocity: {
            days: velocityDays,
            issues: velocityIssues,
          },
          metrics: {
            issues: {
              count: completedIssues.length,
              velocity: velocityIssues.length / velocityWeeks,
            },
            points: {
              count: completedIssues
                .map((j: JiraIssue) => j.points)
                .reduce((acc: number, value: number) => acc + value, 0),
              velocity:
                velocityIssues
                  .map((j: JiraIssue) => j.points)
                  .reduce((acc: number, value: number) => acc + value, 0) /
                velocityWeeks,
            },
          },
        };
      }),
    };
  });
};

// Using velocity calculated for streams, add the effort distribution
const getStreamsDistribution = (streams: Array<any>) => {
  return streams.map((s: CompletionStream) => {
    return {
      ...s,
      weeks: s.weeks.map((w: any) => {
        // Issues Count
        const totalIssuesVelocity = streams
          .map((ts: any) => {
            const week = ts.weeks.find(
              (tw: CompletionWeek) => tw.firstDay === w.firstDay,
            );
            if (week === undefined) {
              return 0;
            }
            return week.metrics.issues.velocity;
          })
          .reduce((acc: number, value: number) => acc + value, 0);
        // Points Count
        const totalPointsVelocity = streams
          .map((ts: any) => {
            const week = ts.weeks.find((tw: any) => tw.firstDay === w.firstDay);
            if (week === undefined) {
              return 0;
            }
            return week.metrics.points.velocity;
          })
          .reduce((acc: number, value: number) => acc + value, 0);
        return {
          ...w,
          metrics: {
            issues: {
              ...w.metrics.issues,
              totalStreams: totalIssuesVelocity,
              distribution:
                w.metrics.issues.velocity === 0
                  ? 0
                  : (w.metrics.issues.velocity * 100) / totalIssuesVelocity,
            },
            points: {
              ...w.metrics.points,
              totalStreams: totalPointsVelocity,
              distribution:
                w.metrics.points.velocity === 0
                  ? 0
                  : (w.metrics.points.velocity * 100) / totalPointsVelocity,
            },
          },
        };
      }),
    };
  });
};

export const getId = (inputstring: string) => {
  return String(inputstring)
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};

const formatForecastStreams = (
  forecastData: any,
  defaultPoints: boolean,
  completionStreams: any,
) => {
  return forecastData.map((c: any) => {
    const streamVelocity = completionStreams.find((s: any) => s.key === c.key);
    let currentMetrics: any = {
      issues: { velocity: 0, distribution: 0, remaining: 0 },
      points: { velocity: 0, distribution: 0, remaining: 0 },
    };
    if (streamVelocity !== undefined) {
      const lastWeek = streamVelocity.weeks.slice(-1)[0];
      currentMetrics = lastWeek.metrics;
    }
    const remainingPoints = c.issues
      .map((i: any) => {
        if (i.metrics.points.remaining === 0) {
          return c.emptyPoints === undefined ? 0 : c.emptyPoints;
        } else {
          return i.metrics.points.remaining;
        }
      })
      .reduce((acc: number, value: number) => acc + value, 0);
    const remainingCount = c.issues
      .map((i: any) => i.metrics.issues.remaining)
      .reduce((acc: number, value: number) => acc + value, 0);

    currentMetrics = {
      issues: {
        ...currentMetrics.issues,
        remaining: remainingCount,
        distributionTarget: c.effortPct,
      },
      points: {
        ...currentMetrics.points,
        remaining: remainingPoints,
        distributionTarget: c.effortPct,
      },
    };

    return {
      ...c,
      metrics: currentMetrics,
    };
  });
};

export const processRestPayload = (
  payload: any,
  defaultPoints: boolean,
  callback: any,
) => {
  // Formats the streams
  let completionStreams = getCompletionStreams(payload.completion);
  // Adds distribution
  completionStreams = getStreamsDistribution(completionStreams);

  const forecastStreams = formatForecastStreams(
    payload.completion.forecast,
    defaultPoints,
    completionStreams,
  );

  const coreData = {
    updatedAt: payload.completion.updatedAt,
    resolutions: payload.completion.resolutions,
    completionData: payload.completion,
    jiraHost: payload.completion.jiraHost,
    completionStreams: completionStreams,
    forecastStreams: forecastStreams,
    simulatedStreams: forecastStreams,
    selectedTeamId: payload.id,
  };
  callback(coreData);
};

export const teams: Teams = {
  state: {
    selectedTeam: null,
    selectedTeamId: null,
    loading: false,
    loadingForecast: false,
    jiraHost: null,
    completionData: null,
    updatedAt: null,
    resolutions: {
      positive: [],
      negative: [],
      ignore: [],
    },
    completionStreams: [],
    forecastStreams: [],
    simulatedStreams: [],

    forecastData: null,
    teamVelocity: { points: 20, issues: 5 },

    showDeleteModal: false,
    deleteModalCacheDays: [],
  },
  reducers: {
    setTeams(state: any, payload: any) {
      return { ...state, teams: payload };
    },
    setCoreData(state: any, payload: any) {
      return {
        ...state,
        completionData: payload.jiraHost,
        updatedAt: payload.updatedAt,
        resolutions: payload.resolutions,
        jiraHost: payload.jiraHost,
        completionStreams: payload.completionStreams,
        forecastStreams: payload.forecastStreams,
        simulatedStreams: payload.simulatedStreams,
        selectedTeamId: payload.selectedTeamId,
      };
    },
    setCompletionData(state: any, payload: any) {
      return { ...state, completionData: payload };
    },
    setCompletionStreams(state: any, payload: any) {
      return { ...state, completionStreams: payload };
    },
    setForecastData(state: any, payload: any) {
      return { ...state, forecastData: payload };
    },
    setSelectedTeam(state: any, payload: any) {
      return { ...state, selectedTeam: payload };
    },
    setSelectedTeamId(state: any, payload: any) {
      return { ...state, selectedTeamId: payload };
    },
    setLoading(state: any, payload: any) {
      return { ...state, loading: payload };
    },
    setLoadingForecast(state: any, payload: any) {
      return { ...state, loadingForecast: payload };
    },
    setForecastStreams(state: any, payload: any) {
      return { ...state, forecastStreams: payload };
    },
    setSimulatedStreams(state: any, payload: any) {
      return { ...state, simulatedStreams: payload };
    },
    setTeamVelocity(state: any, payload: any) {
      return { ...state, teamVelocity: payload };
    },
    setJiraHost(state: any, payload: any) {
      return { ...state, jiraHost: payload };
    },
    setShowDeleteModal(state: any, payload: any) {
      return { ...state, showDeleteModal: payload };
    },
    setDeleteModalCacheDays(state: any, payload: any) {
      return { ...state, deleteModalCacheDays: payload };
    },
  },
  effects: {
    async initView(teamObj: any, rootState: any) {
      const logger = log.noConflict();
      if (process.env.NODE_ENV !== 'production') {
        logger.enableAll();
      } else {
        logger.disableAll();
      }

      const { selectedTeamId } = teamObj;
      logger.info(`Initialized Team view (tean: ${selectedTeamId})`);

      // this.loadCompletionFromCache(selectedTeamId);
      if (
        JSON.parse(window._env_.AUTH0_DISABLED) === true ||
        (JSON.parse(window._env_.AUTH0_DISABLED) !== true &&
          rootState.global.accessToken !== '')
      ) {
        logger.info('Loading data');
        this.fetchTeamData(selectedTeamId);
      } else {
        logger.info(
          'Not loading data, either there is already some data in cache or user token not (yet) present',
        );
      }
    },

    async loadCompletionFromCache(teamId: any, rootState: any) {
      // If previous data was loaded and saved in localstorage
      // it will first display the cache, while the call to the backend is happening
      const cacheCompletion = reactLocalStorage.getObject(
        `cache-completion-${teamId}`,
      );
      if (Object.keys(cacheCompletion).length > 0) {
        console.log(
          '[Teams] Loading Velocity data from cache while call to the backend is happening',
        );
        processRestPayload(
          reactLocalStorage.getObject(`cache-completion-${teamId}`),
          rootState.global.defaultPoints,
          this.setCoreData,
        );
      }
    },

    async fetchTeamData(teamId: any, rootState: any) {
      // this.loadCompletionFromCache(teamId);
      if (rootState.teams.loading === false) {
        const setCoreData = this.setCoreData;
        const setLoading = this.setLoading;

        if (teamId !== null) {
          console.log('[Teams] Fetching completion data for team: ' + teamId);

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
            url: host + '/completion/' + teamId,
            headers,
          })
            .then((response) => {
              console.log(
                '[Teams] Data received from backend for team: ' + teamId,
              );

              processRestPayload(
                response.data,
                rootState.global.defaultPoints,
                setCoreData,
              );
              reactLocalStorage.setObject(
                `cache-completion-${teamId}`,
                response.data,
              );
              setLoading(false);
            })
            .catch((error) => {
              console.log(error);
              setLoading(false);
            });
        }
      }
    },
    async clearCacheDay(cacheDay: any, rootState: any) {
      // Fetch data
      const setDeleteModalCacheDays = this.setDeleteModalCacheDays;
      const deleteModalRefreshCacheDays = this.deleteModalRefreshCacheDays;
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
          method: 'delete',
          url: `${host}/cachedays/${rootState.teams.selectedTeamId}/${cacheDay}`,
          headers,
        })
          .then((response) => {
            setDeleteModalCacheDays(response.data);
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setLoading(false);
            deleteModalRefreshCacheDays();
          });
      } else {
        console.log(
          '[Teams] Not loading data, either there is already some data in cache or user token not present',
        );
      }
    },

    async deleteModalRefreshCacheDays(roadmap: any, rootState: any) {
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
            : undefined;
        axios({
          method: 'get',
          url: `${host}/cachedays/${rootState.teams.selectedTeamId}`,
          headers,
        })
          .then((response) => {
            setDeleteModalCacheDays(response.data);
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setDeleteModalCacheDays([]);
            setLoading(false);
          });
      } else {
        console.log(
          '[Teams] Not loading data, either there is already some data in cache or user token not present',
        );
      }
    },
  },
};
