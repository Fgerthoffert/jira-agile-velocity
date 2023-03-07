/* eslint max-depth: ["error", 7] */
/* eslint max-params: ["error", 7] */
/* eslint-env es6 */

/*
    Group all versions by name
*/
const groupVersions = (versions: Array<any>) => {
  return versions.reduce((acc: Array<any>, v: any) => {
    // Search issue in accumulator
    if (acc.find(a => a.name === v.name) === undefined) {
      // Format and push issue
      acc.push({
        name: v.name,
        archived: v.archived,
        released: v.released,
        releaseDate: v.releaseDate,
        userReleaseDate: v.userReleaseDate,
        projects: [
          {
            projectId: v.projectId,
            projectKey: v.projectKey,
            versionId: v.id,
          },
        ],
      });
      return acc;
    }
    return acc.map((a: any) => {
      if (a.name === v.name) {
        const projects = a.projects;
        if (
          a.projects.find((p: any) => p.projectKey === v.projectKey) ===
          undefined
        ) {
          projects.push({
            projectId: v.projectId,
            projectKey: v.projectKey,
            versionId: v.id,
          });
        }
        const releaseDate =
          a.releaseDate === undefined ? v.releaseDate : a.releaseDate;
        const userReleaseDate =
          a.userReleaseDate === undefined
            ? v.userReleaseDate
            : a.userReleaseDate;
        if (a.release)
          return {
            ...a,
            releaseDate,
            userReleaseDate,
            projects,
          };
      }
      return a;
    });
  }, []);
};

export default groupVersions;
