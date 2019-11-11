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

// eslint-disable-next-line
interface ICompletion {
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
// eslint-disable-next-line
export interface IJiraIssue {
  closedAt: string;
  expand: string;
  id: string;
  self: string;
  key: string;
  team: string;
  fields: any;
  jql: string; // JQL Query used to fetch the issue
}

// eslint-disable-next-line
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

// eslint-disable-next-line
interface IDaysObj {
  [key: string]: IDays;
}

// eslint-disable-next-line
export interface IWeeks {
  date: string;
  weekStart: string;
  weekNb: number;
  weekTxt: string;
  weekJira: string;
  completion: ICompletion;
  scopeChangeCompletion: ICompletion;
}

// eslint-disable-next-line
interface IWeeksObj {
  [key: string]: IWeeks;
}

// eslint-disable-next-line
interface IOpen {
  issues: { count: number };
  points: { count: number };
  list: Array<IJiraIssue>;
}

// eslint-disable-next-line
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

// eslint-disable-next-line
interface IForecast {
  range: string;
  completion: IForecastCompletion;
}

// eslint-disable-next-line
interface IHealthVelocityTrend {
  trend: string;
  previous: number;
  current: number;
}
// eslint-disable-next-line
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

// eslint-disable-next-line
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

// eslint-disable-next-line
export interface ICalendar {
  days: IDaysObj;
  weeks: IWeeksObj;
  open: IOpen | object;
  forecast: IForecast | object;
  health: IHealth | object;
}

// eslint-disable-next-line
export interface ICalendarFinal {
  days: Array<IDays>;
  weeks: Array<IWeeks>;
  open: IOpen | object;
  forecast: IForecast | object;
  health: IHealth | object;
}

// eslint-disable-next-line
export interface IConfig {
  jira: IConfigJira;
  teams: Array<IConfigTeam>;
  roadmap: IConfigRoadmap;
}

// eslint-disable-next-line
export interface IConfigTeam {
  name: string;
  jqlCompletion: string;
  jqlRemaining: string;
  jqlHistory: string;
  excludeDays: Array<string>;
  slack: {
    token: string;
    channel: string;
    explanation: string;
  };
}

// eslint-disable-next-line
export interface IConfigJira {
  username: string;
  password: string;
  host: string;
  fields: {
    points: string;
    originalPoints: string;
    parentInitiative: string;
    parentEpic: string;
  };
  excludeDays: Array<string>;
}

// eslint-disable-next-line
export interface IConfigRoadmap {
  jqlInitiatives: string;
  teams: Array<string>;
  forecastWeeks: number;
}
