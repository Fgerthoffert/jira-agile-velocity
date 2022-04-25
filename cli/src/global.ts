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
  openedForBusinessDays: number;
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

export interface IConfig {
  jira: IConfigJira;
  teams: Array<IConfigTeam>;
  roadmap: IConfigRoadmap;
}

export interface IConfigTeam {
  name: string;
  from: string;
  completion: {
    all: string;
    categories: Array<{
      name: string;
      jql: string;
    }>;
  };
  excludeDays: Array<string>;
  jqlCompletion: string;
  jqlRemaining: string;
  jqlHistory: string;
  initiativeEffortPrct: number;
  slack: {
    token: string;
    channel: string;
    explanation: string;
  };
}

export interface IConfigJira {
  username: string;
  password: string;
  host: string;
  fields: {
    points: string;
    originalPoints: string;
    parentInitiative: string;
    parentEpic: string;
    sprints: string;
  };
  excludeDays: Array<string>;
}

export interface IConfigRoadmap {
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
