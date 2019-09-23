/*
    Returns an id from a team name by making the string lowercase and stripping all non alphanumerical characters 
*/
export const getTeamId = (teamName: string) => {
  return String(teamName)
    .replace('team-', '') // If team is prefixed by team-, we simply remove it from the string
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};

export const getTeamFromAssignee = (issue: any, teams: Array<string>) => {
  if (issue.fields.assignee === null) {
    return null;
  } else {
    for (let team of teams) {
      if (getTeamId(issue.fields.assignee.name) === getTeamId(team)) {
        return team;
      }
    }
  }
  return null;
};
