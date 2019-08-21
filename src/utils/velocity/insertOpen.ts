/*
    This function add details about the open issues
*/

const insertOpen = (calendar: any, issues: [any], jira_points: string) => {
  const updatedCalendar = JSON.parse(JSON.stringify(calendar));

  const remainingPoints = issues
    .filter((issue: any) => issue.fields[jira_points] !== undefined)
    .map((issue: any) => issue.fields[jira_points])
    .reduce((acc: number, points: number) => acc + points, 0);

  updatedCalendar["open"] = {
    issues: { count: issues.length },
    points: { count: remainingPoints },
    list: issues
  };

  return updatedCalendar;
};

export default insertOpen;
