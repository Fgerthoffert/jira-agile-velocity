interface PayloadIssue {
  id: string;
  key: string;
  summary: string;
  type: {
    name: string;
    iconUrl: string;
  };
  status: {
    name: string;
    category: string;
  };
  isLeaf: string;
  metrics: {
    points: {
      total: number;
      completed: number;
      remaining: number;
      missing: number;
    };
    issues: {
      total: number;
      completed: number;
      remaining: number;
      missing: number;
    };
  };
}
interface PayloadInitiative extends PayloadIssue {
  weeks: Array<PayloadWeek>;
  children: Array<PayloadTree>;
}

interface PayloadTree extends PayloadIssue {
  children: Array<PayloadTree>;
}

interface PayloadWeek {
  list: Array<PayloadIssue>;
  metrics: {
    issues: {
      total: number;
    };
    points: {
      total: number;
    };
  };
}

export interface ICompletion {
  issues: {
    count: number;
    velocity: number;
  };
  points: {
    count: number;
    velocity: number;
  };
  list: Array<IJiraIssue>;
}
export interface IJiraIssue {
  closedAt: string;
  expand: string;
  id: string;
  self: string;
  key: string;
  team: string;
  fields: any;
  points: number;
  jql: string; // JQL Query used to fetch the issue
  openedForDays: number;
  daysToRelease?: number;
  weeksToRelease?: number;
  monthsToRelease?: number;
  daysToReleaseIfToday?: number;
  weeksToReleaseIfToday?: number;
  monthsToReleaseIfToday?: number;
  daysToResolution?: number;
  weeksToResolution?: number;
  monthsToResolution?: number;
}

export interface IDays {
  date: string;
  weekDay: number;
  weekDayTxt: string;
  weekDayJira: string;
  weekNb: number;
  weekTxt: string;
  completion: ICompletion;
  scopeChangeCompletion: ICompletion;
}

interface IDaysObj {
  [key: string]: IDays;
}

export interface IWeeks {
  date: string;
  weekStart: string;
  weekEnd: string;
  weekNb: number;
  weekTxt: string;
  weekJira: string;
  completion: ICompletion;
  control?: any;
  scopeChangeCompletion: ICompletion;
}

export interface IWeeksControl {
  date: string;
  weekStart: string;
  weekEnd: string;
  weekNb: number;
  weekTxt: string;
  weekJira: string;
  current: any;
  openedForAvg: number;
  openedForRolling: number;
  controlValues: Array<number>;
}

interface IWeeksObj {
  [key: string]: IWeeks;
}

interface IOpen {
  issues: { count: number };
  points: { count: number };
  list: Array<IJiraIssue>;
}

interface IForecastCompletion {
  issues: {
    openCount: number;
    velocity: number;
    effortDays: number;
  };
  points: {
    openCount: number;
    velocity: number;
    effortDays: number;
  };
}

interface IForecast {
  range: string;
  completion: IForecastCompletion;
}

interface IHealthVelocityTrend {
  trend: string;
  previous: number;
  current: number;
}

interface IHealthCompletion {
  msgTxt: string;
  msgJira: string;
  issues: {
    list: Array<number>;
    count: number;
    min: number;
    max: number;
    avg: number;
  };
  points: {
    list: Array<number>;
    count: number;
    min: number;
    max: number;
    avg: number;
  };
}

interface IHealth {
  days: {
    velocity: {
      issues: IHealthVelocityTrend;
      points: IHealthVelocityTrend;
    };
    completion: IHealthCompletion;
  };
  weeks: {
    velocity: {
      issues: IHealthVelocityTrend;
      points: IHealthVelocityTrend;
    };
    completion: IHealthCompletion;
  };
}

export interface ICalendar {
  days: IDaysObj;
  weeks: IWeeksObj;
  open: IOpen | object;
  forecast: IForecast | object;
  health: IHealth | object;
}

export interface ICalendarFinal {
  days: Array<IDays>;
  weeks: Array<IWeeks>;
  open: IOpen | object;
  forecast: IForecast | object;
  health: IHealth | object;
  control?: Array<any>;
}

export interface UserConfig {
  jira: UserConfigJira;
  report: {
    github: {
      token: string;
      owner: string;
      repository: string;
      label: string;
    };
    initiatives: {
      jql: string;
    };
    releasePipeline: {
      jql: string;
    };
    distributionTeams: Array<string>;
  };
  versions: {
    projectKeys: Array<string>;
    monthsToChart: number;
    from: string;
    defaultFilters: {
      name: string;
      projectKey: string;
      label: string;
      issueType: string;
      priority: string;
    };
  };
  teams: Array<UserConfigTeam>;
}

export interface UserConfigTeam {
  name: string;
  from: string;
  excludeDays: Array<string>;
  streams: Array<UserConfigStream>;
}

export interface UserConfigStream {
  name: string;
  completion: {
    jql: string;
    childOf: string;
  };
  forecast: {
    jql: string;
    fetchChild: boolean;
    effortPct: number;
  };
}

export interface UserConfigJira {
  username: string;
  password: string;
  host: string;
  fields: {
    points: string;
    originalPoints: string;
    parentInitiative: string;
    parentEpic: string;
    sprint: string;
    deliveryConfidence: string;
    expectedDelivery: string;
  };
  excludeDays: Array<string>;
  resolutions: {
    positive: Array<string>;
    negative: Array<string>;
    ignore: Array<string>;
  };
}

export interface UserConfigRoadmap {
  jqlInitiatives: string;
  teams: Array<string>;
  forecastWeeks: number;
}

export interface IControlBucket {
  key: string;
  value: string;
  color: string;
  isInBucket: Function;
}

export interface CompletedDay {
  issues: Array<IJiraIssue>;
}

export interface CompletedStream {
  key: string;
  name: string;
  jql: string;
  childOf: string;
  days: Array<CompletedDay>;
  // childIssues: Array<IssueObjChild>;
  issues: Array<IssueObjChild>;
}

export interface ForecastStream {
  key: string;
  name: string;
  jql: string;
  fetchChild?: boolean;
  effortPct: number;
  issues: Array<IJiraIssue>;
}

export interface IssueObjChild {
  key: string;
  parent: {
    key: string;
    summary: string;
  };
}

export interface JiraIssue {
  key: string;
  closedAt: string; // new Date().toISOString() representation of the date the issue was closed
  points: number; // Number of points associated with the issue
  openedForDays: string; // Number of days the issue was opened for
  // eslint-disable-next-line no-explicit-any
  fiels: any; // Other Jira issue fields, using "any" for the time being
}

export interface CompletionData {
  name: string; // Team Name
  from: string; // Date from which data collection started
  excludeDays: Array<string>; // Array of days excluded from analysis
  completion: Array<CompletionStream>;
}

export interface CompletionDay {
  day: Date; // new Date().toISOString() representation of the date
  issues: Array<JiraIssue>;
}
// A completion stream contains data and metrics about elements in the past
export interface CompletionStream {
  name: string; // Name of the completion stream
  key: string; // Key of the stream, automatically generated from the name
  jql: string; // JQL query used to fetch the completion data
  childIssues: Array<IssueObjChild>;
  days: Array<CompletionDay>;
  childOf: string;
  weeks: Array<CompletionWeek>;
  issues: Array<CompletionIssues>;
}

export interface CompletionWeek {
  firstDay: Date; // First day of the week
  issues: Array<JiraIssue>;
  completed: {
    // Actual completion for the week
    days: Array<CompletionDay>;
    issues: Array<JiraIssue>;
  };
  velocity: {
    // Window of days & issues used for calculating the velocity
    days: Array<CompletionDay>;
    issues: Array<JiraIssue>;
  };
  metrics: {
    issues: {
      count: number;
      velocity: number;
      totalStreams: number;
      distribution: number;
    };
    points: {
      count: number;
      velocity: number;
      totalStreams: number;
      distribution: number;
    };
  };
}

export interface CompletionIssues {
  key: string;
  issues: Array<string>;
  children: Array<string>;
  weeks: Array<CompletionWeek>;
}
