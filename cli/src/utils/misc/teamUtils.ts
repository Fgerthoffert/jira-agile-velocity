/*
    Returns an id from a team name by making the string lowercase and stripping all non alphanumerical characters 
*/
export const getTeamId = (teamName: string) => {
  return String(teamName)
    .replace(/[^a-z0-9+]+/gi, "")
    .toLowerCase();
};
