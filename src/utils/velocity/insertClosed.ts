import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import * as stream from "stream";

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

interface IJiraIssue {
  expand: string;
  id: string;
  self: string;
  key: string;
  fields: any;
}

interface IDays {
  date: string;
  weekDay: number;
  weekDayTxt: string;
  completion: ICompletion;
  scopeChangeCompletion: ICompletion;
}

interface IDaysObj {
  [key: string]: IDays;
}

interface IWeeks {
  date: string;
  weekStart: string;
  weekNb: number;
  weekTxt: string;
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
  txt: string;
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

interface ICalendar {
  days: IDaysObj;
  weeks: IWeeksObj;
  open: IOpen;
  forecast: IForecast;
  health: IHealth;
}

/*
    This function receives an empty calendar and populates it with issues by reading files from cache
*/
const insertClosed = async (
  calendar: ICalendar,
  cacheDir: string,
  jiraPoints: string
) => {
  const updatedCalendar: ICalendar = JSON.parse(JSON.stringify(calendar));
  for (let [dateKey, dateData] of Object.entries(updatedCalendar.days)) {
    const issuesFile = path.join(cacheDir, "completed-" + dateKey + ".ndjson");
    const issues = await readIssues(issuesFile);
    //console.log("Reading issues from file: " + issuesFile + ' - Issues found: ' + issues.length)
    for (let issue of issues) {
      if (updatedCalendar.days[dateKey] !== undefined) {
        updatedCalendar.days[dateKey].completion.issues.count++;
        updatedCalendar.days[dateKey].completion.list.push(issue);
        if (
          issue.fields[jiraPoints] !== undefined &&
          issue.fields[jiraPoints] !== null
        ) {
          updatedCalendar.days[dateKey].completion.points.count += parseInt(
            issue.fields[jiraPoints]
          );
        }
        if (
          issue.fields.labels.filter(
            (label: string) =>
              stringClean(label) === stringClean("Scope Change")
          ).length !== 0
        ) {
          updatedCalendar.days[dateKey].scopeChangeCompletion.issues.count++;
          updatedCalendar.days[dateKey].scopeChangeCompletion.list.push(issue);
          if (
            issue.fields[jiraPoints] !== undefined &&
            issue.fields[jiraPoints] !== null
          ) {
            updatedCalendar.days[
              dateKey
            ].scopeChangeCompletion.points.count += parseInt(
              issue.fields[jiraPoints]
            );
          }
        }
      }
      // Add issue to the week object
      const closedDate = new Date(dateData.date);
      let closedMonthDay = closedDate.getDate();
      if (closedDate.getDay() !== 0) {
        closedMonthDay = closedMonthDay - closedDate.getDay();
      }
      const closedWeek = new Date(
        closedDate.getFullYear(),
        closedDate.getMonth(),
        closedMonthDay
      );
      const closedWeekKey = closedWeek.toJSON().slice(0, 10);
      if (updatedCalendar.weeks[closedWeekKey] !== undefined) {
        updatedCalendar.weeks[closedWeekKey].completion.issues.count++;
        updatedCalendar.weeks[closedWeekKey].completion.list.push(issue);
        if (
          issue.fields[jiraPoints] !== undefined &&
          issue.fields[jiraPoints] !== null
        ) {
          updatedCalendar.weeks[
            closedWeekKey
          ].completion.points.count += parseInt(issue.fields[jiraPoints]);
        }
        if (
          issue.fields.labels.filter(
            (label: string) =>
              stringClean(label) === stringClean("Scope Change")
          ).length !== 0
        ) {
          updatedCalendar.weeks[closedWeekKey].scopeChangeCompletion.issues
            .count++;
          updatedCalendar.weeks[closedWeekKey].scopeChangeCompletion.list.push(
            issue
          );
          if (
            issue.fields[jiraPoints] !== undefined &&
            issue.fields[jiraPoints] !== null
          ) {
            updatedCalendar.weeks[
              closedWeekKey
            ].scopeChangeCompletion.points.count += parseInt(
              issue.fields[jiraPoints]
            );
          }
        }
      }
    }
  }
  return updatedCalendar;
};

/*
Returns a list of issues completed on a particular day, either from cache of by fetching a new batch
*/
const readIssues = async (issuesFile: string) => {
  const issues = [];
  if (fs.existsSync(path.join(issuesFile))) {
    const input = fs.createReadStream(issuesFile);
    for await (const line of readLines(input)) {
      issues.push(JSON.parse(line));
    }
  }
  return issues;
};

//https://medium.com/@wietsevenema/node-js-using-for-await-to-read-lines-from-a-file-ead1f4dd8c6f
const readLines = (input: any) => {
  const output = new stream.PassThrough({ objectMode: true });
  const rl = readline.createInterface({ input });
  rl.on("line", line => {
    output.write(line);
  });
  rl.on("close", () => {
    output.push(null);
  });
  return output;
};

const stringClean = (labelName: string) => {
  return String(labelName)
    .replace(/[^a-z0-9+]+/gi, "")
    .toLowerCase();
};

export default insertClosed;
