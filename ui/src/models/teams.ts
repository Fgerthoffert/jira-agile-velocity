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

const formatStreams = (
  forecastData: any,
  defaultPoints: boolean,
  teamVelocity: TeamVelocity,
) => {
  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }
  const currentTeamVelocity: number = teamVelocity.points;
  // const currentTeamVelocity = 25;
  return forecastData.forecast.categories.map((c: any) => {
    const remaining = c.issues
      .map((i: any) => {
        if (i.metrics[metric].remaining === 0) {
          return c.emptyPoints === undefined ? 0 : c.emptyPoints;
        } else {
          return i.metrics[metric].remaining;
        }
      })
      .reduce((acc: number, value: number) => acc + value, 0);
    const velocity =
      Math.round((currentTeamVelocity / 100) * c.effortPct * 10) / 10;
    return {
      key: getId(c.name),
      name: c.name,
      remaining: remaining,
      remainingCount: c.issues
        .map((i: any) => i.metrics.issues.remaining)
        .reduce((acc: number, value: number) => acc + value, 0),
      effortPct: c.effortPct,
      velocity: velocity,
      timeToCompletion: Math.round((remaining / velocity) * 10) / 10,
      items:
        c.fetchChild === false
          ? []
          : c.issues
              .map((i: any) => {
                return {
                  name: i.summary,
                  remaining: i.metrics[metric].remaining,
                };
              })
              .filter((i: any) => i.remaining > 0),
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

    forecastData: null,
    streams: [],
    teamVelocity: { points: 20, issues: 5 },

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
    setStreams(state: any, payload: any) {
      return { ...state, streams: payload };
    },
    setTeamVelocity(state: any, payload: any) {
      return { ...state, teamVelocity: payload };
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
        this.fetchTeamForecastData(selectedTeamId);
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

    async loadForecastFromCache(teamId: any) {
      // If previous data was loaded and saved in localstorage
      // it will first display the cache, while the call to the backend is happening
      const cacheForecast = reactLocalStorage.getObject(
        `cache-forecast-${teamId}`,
      );
      if (Object.keys(cacheForecast).length > 0) {
        log.info(
          'Loading Forecast data from cache while call to the backend is happening',
        );
        this.setForecastData(
          reactLocalStorage.getObject(`cache-forecast-${teamId}`),
        );
      }
    },

    async fetchTeamForecastData(teamId: any, rootState: any) {
      this.loadForecastFromCache(teamId);
      if (rootState.teams.loadingForecast === false) {
        const setForecastData = this.setForecastData;
        const setLoadingForecast = this.setLoadingForecast;
        const setStreams = this.setStreams;
        if (teamId !== null) {
          const log = rootState.global.log;
          log.info('Fetching forecastdata for team: ' + teamId);

          setLoadingForecast(true);
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
            url: host + '/forecast/' + teamId,
            headers,
          })
            .then((response) => {
              setForecastData(response.data.forecast);
              setStreams(
                formatStreams(
                  response.data.forecast,
                  rootState.global.defaultPoints,
                  rootState.teams.teamVelocity,
                ),
              );
              reactLocalStorage.setObject(
                `cache-forecast-${teamId}`,
                response.data.forecast,
              );
              setLoadingForecast(false);
            })
            .catch((error) => {
              console.log(error);
              setLoadingForecast(false);
            });
        }
      }
    },
    async updateGraph(payload: any, rootState: any) {
      const logsvc = rootState.roadmap.log;
      const t0 = performance.now();

      const sourceIssues = fetchGraphIssues(rootState.roadmap.graphInitiative);
      let highestDistance = 10;
      if (sourceIssues.length > 0) {
        highestDistance = sourceIssues
          .map((i) => i.data.distance)
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
        (i) => i.data.distance <= maxDistance,
      );
      this.initGraphData(filteredIssue);
      const t1 = performance.now();

      this.setGraphUpdating(false);
      logsvc.info('updateGraph - took ' + (t1 - t0) + ' milliseconds.');
    },

    async initGraphData(graphIssues: any, rootState: any) {
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
  },
};
