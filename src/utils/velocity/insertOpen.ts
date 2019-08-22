// tslint:disable-next-line: file-name-casing
import { ICalendar, IJiraIssue } from "../../global";

/*
    This function add details about the open issues
*/
const insertOpen = (
  calendar: ICalendar,
  issues: Array<IJiraIssue>,
  jira_points: string
) => {
  const updatedCalendar: ICalendar = JSON.parse(JSON.stringify(calendar));

  const remainingPoints = issues
    .filter((issue: IJiraIssue) => issue.fields[jira_points] !== undefined)
    .map((issue: IJiraIssue) => issue.fields[jira_points])
    .reduce((acc: number, points: number) => acc + points, 0);

  updatedCalendar.open = {
    issues: { count: issues.length },
    points: { count: remainingPoints },
    list: issues
  };

  return updatedCalendar;
};

export default insertOpen;
