export interface VIssue {
  key: string;
  summary: string;
  labels: Array<string>;
  created: string;
  daysToRelease: number;
  daysToReleaseIfToday: number;
  daysToResolution: number;
  monthsToRelease: number;
  monthsToReleaseIfToday: number;
  monthsToResolution: number;
  weeksToRelease: number;
  weeksToReleaseIfToday: number;
  weeksToResolution: number;
  points: number;
  priority: string;
  projectKey: string;
  release: VRelease;
  resolution: string;
  resolutiondate: string;
  status: string;
  type: string;
}

export interface VRelease {
  name: string;
  archived: boolean;
  released: boolean;
  releaseDate: string;
  userReleaseDate: string;
  issues: Array<VIssue>;
  projects: Array<VProject>;
}

export interface VProject {
  projectId: number;
  projectKey: string;
  versionId: number;
}

export interface JiraIssue {
  key: string;
  closedAt: string; // new Date().toISOString() representation of the date the issue was closed
  points: number; // Number of points associated with the issue
  openedForDays: string; // Number of days the issue was opened for
  // eslint-disable-next-line
  fiels: any; // Other Jira issue fields, using "any" for the time being
}

export interface CompletionData {
  name: string; // Team Name
  from: string; // Date from which data collection started
  excludeDays: Array<string>; // Array of days excluded from analysis
  completion: Array<CompletionStream>;
}

export interface StreamWeek {
  firstWeekDay: Date;
  lastWeekDay: Date;
  startOfWeek: Date;
  endOfWeek: Date;
  weekTxt: string;
  completed: number;
  remaining: {
    atWeekStart: number;
    atWeekEnd: number;
  };
}

export interface StreamItem {
  name: string;
  remaining: number;
  weeks?: Array<StreamWeek>;
  stream?: string;
}

export interface Stream {
  key: string;
  name: string;
  remaining: number;
  effortPct: number;
  items: Array<StreamItem>;
  weeks?: Array<StreamWeek>;
}

export interface CompletionDay {
  day: Date; // new Date().toISOString() representation of the date
  issues: Array<JiraIssue>;
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

export interface IssueObjChild {
  key: string;
  parentKey: string;
}

export interface CompletionIssues {
  key: string;
  issues: Array<string>;
  children: Array<string>;
  weeks: Array<CompletionWeek>;
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
