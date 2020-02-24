import { ICalendar, IJiraIssue } from '../../global';

/*
    This function add details about the open issues
*/
const insertOpen = (calendar: ICalendar, issues: Array<IJiraIssue>) => {
  const updatedCalendar: ICalendar = JSON.parse(JSON.stringify(calendar));

  const remainingPoints = issues
    .filter((issue: IJiraIssue) => issue.points !== undefined)
    .map((issue: IJiraIssue) => issue.points)
    .reduce((acc: number, points: number) => acc + points, 0);

  updatedCalendar.open = {
    issues: { count: issues.length },
    points: { count: remainingPoints },
    list: issues,
  };

  return updatedCalendar;
};

export default insertOpen;
