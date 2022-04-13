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
