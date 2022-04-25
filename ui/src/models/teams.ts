import * as log from 'loglevel';
import { createModel } from '@rematch/core';
import axios from 'axios';
import { reactLocalStorage } from 'reactjs-localstorage';
import { fetchGraphIssues } from '../utils/graph';

import {
  CompletionData,
  CompletionStream,
  CompletionDay,
  JiraIssue,
} from '../global';

import {
  startOfWeek,
  add,
  isEqual,
  differenceInDays,
  differenceInWeeks,
} from 'date-fns';

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

interface TeamVelocity {
  points: number;
  issues: number;
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
  const velocityWeeks = 4;
  const emptyCalendar = getEmptyCalendar(
    new Date(completionData.from),
    new Date(),
  );
  return completionData.completion.map((s: CompletionStream) => {
    return {
      ...s,
      weeks: emptyCalendar.map((w: CompletionWeek) => {
        // Filter by days completed during that week
        const completedDays = s.days.filter((d: CompletionDay) =>
          isEqual(startOfWeek(new Date(d.day)), w.firstDay),
        );
        const completedIssues = completedDays.reduce((acc: any, day: any) => {
          return [...acc, ...day.issues];
        }, []);

        // Gather data for velocity window
        const velocityDays = s.days.filter(
          (d: CompletionDay) =>
            new Date(d.day) < w.firstDay &&
            differenceInWeeks(w.firstDay, startOfWeek(new Date(d.day))) <=
              velocityWeeks,
        );
        const velocityIssues = velocityDays.reduce((acc: any, day: any) => {
          return [...acc, ...day.issues];
        }, []);
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
            const week = ts.weeks.find((tw: any) => tw.firstDay === w.firstDay);
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
  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }
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

export const teams: Teams = {
  state: {
    selectedTeam: null,
    selectedTeamId: null,
    loading: false,
    loadingForecast: false,
    jiraHost: null,
    completionData: null,
    completionStreams: [],
    forecastStreams: [],
    simulatedStreams: [],

    forecastData: null,
    teamVelocity: { points: 20, issues: 5 },
  },
  reducers: {
    setTeams(state: any, payload: any) {
      return { ...state, teams: payload };
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
  },
  effects: {
    async initView(teamObj: any, rootState: any) {
      console.log(teamObj);
      const { selectedTeamId, selectedTab } = teamObj;
      const log = rootState.global.log;
      log.info(`Initialized Team view (tean: ${selectedTeamId})`);

      this.loadCompletionFromCache(selectedTeamId);
      if (
        JSON.parse(window._env_.AUTH0_DISABLED) === true ||
        (JSON.parse(window._env_.AUTH0_DISABLED) !== true &&
          rootState.global.accessToken !== '')
      ) {
        log.info('Loading data');
        this.fetchTeamData(selectedTeamId);
      } else {
        log.info(
          'Not loading data, either there is already some data in cache or user token not (yet) present',
        );
      }
    },

    async loadCompletionFromCache(teamId: any) {
      // If previous data was loaded and saved in localstorage
      // it will first display the cache, while the call to the backend is happening
      const cacheVelocity = reactLocalStorage.getObject(
        `cache-velocity-${teamId}`,
      );
      if (
        Object.keys(cacheVelocity).length > 0 &&
        cacheVelocity.find((t: any) => t.id === teamId) !== undefined
      ) {
        log.info(
          'Loading Velocity data from cache while call to the backend is happening',
        );
        this.setCompletionData(
          reactLocalStorage.getObject(`cache-completion-${teamId}`),
        );
      }
    },

    async fetchTeamData(teamId: any, rootState: any) {
      this.loadCompletionFromCache(teamId);
      if (rootState.teams.loading === false) {
        const setCompletionData = this.setCompletionData;
        const setCompletionStreams = this.setCompletionStreams;
        const setForecastStreams = this.setForecastStreams;
        const setSimulatedStreams = this.setSimulatedStreams;

        const setLoading = this.setLoading;
        const setSelectedTeam = this.setSelectedTeam;
        const setJiraHost = this.setJiraHost;
        if (teamId !== null) {
          const log = rootState.global.log;
          log.info('Fetching completion data for team: ' + teamId);

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
            url: host + '/completion/' + teamId,
            headers,
          })
            .then((response) => {
              setCompletionData(response.data.completion);
              setJiraHost(response.data.completion.jiraHost);

              // Formats the streams
              let completionStreams = getCompletionStreams(
                response.data.completion,
              );
              // Adds distribution
              completionStreams = getStreamsDistribution(completionStreams);
              setCompletionStreams(completionStreams);

              console.log(completionStreams);
              console.log(response.data);
              const forecastStreams = formatForecastStreams(
                response.data.completion.forecast,
                rootState.global.defaultPoints,
                completionStreams,
              );
              console.log(forecastStreams);
              setForecastStreams(forecastStreams);
              setSimulatedStreams(forecastStreams);
              setSelectedTeam(response.data.completion.name);
              reactLocalStorage.setObject(
                `cache-completion-${rootState.teams.setSelectedTeamId}`,
                response.data.completion,
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
  },
};
