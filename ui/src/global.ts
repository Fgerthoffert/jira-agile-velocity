export interface JiraIssue {
  key: string;
  closedAt: string; // new Date().toISOString() representation of the date the issue was closed
  points: number; // Number of points associated with the issue
  openedForBusinessDays: string; // Number of business days the issue was opened for
  fiels: any; // Other Jira issue fields, using "any" for the time being
}

export interface CompletionDay {
  day: string; // new Date().toISOString() representation of the date
  issues: Array<JiraIssue>;
}

export interface CompletionWeek {
  firstDay: string; // First day of the week
  issues: Array<JiraIssue>;
}

export interface CompletionStream {
  name: string; // Name of the completion stream
  key: string; // Key of the stream, automatically generated from the name
  jql: string; // JQL query used to fetch the completion data
  days: Array<CompletionDay>;
  weeks: Array<CompletionWeek>;
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
