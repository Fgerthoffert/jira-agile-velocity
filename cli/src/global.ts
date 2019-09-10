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

export interface IDays {
  date: string;
  weekDay: number;
  weekDayTxt: string;
  weekDayJira: string;
  completion: ICompletion;
  scopeChangeCompletion: ICompletion;
}

interface IDaysObj {
  [key: string]: IDays;
}

export interface IWeeks {
  date: string;
  weekStart: string;
  weekNb: number;
  weekTxt: string;
  weekJira: string;
  completion: ICompletion;
  scopeChangeCompletion: ICompletion;
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
}

export interface IConfig {
  jira: IConfigJira;
  teams: Array<IConfigTeam>;
  roadmap: IConfigRoadmap;
  api: { jwtSecret: string };
}

export interface IConfigTeam {
  name: string;
  jqlCompletion: string;
  jqlRemaining: string;
  jqlHistory: string;
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
    parentInitiative: string;
    parentEpic: string;
  };
}

export interface IConfigRoadmap {
  jqlInitiatives: string;
  teams: Array<string>;
  forecastWeeks: number;
}
