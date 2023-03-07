/* eslint max-depth: ["error", 7] */
/* eslint max-params: ["error", 7] */
/* eslint-env es6 */

import cli from 'cli-ux';
import { parse } from 'date-fns';

import { UserConfigJira } from '../../global';
import jiraFetchVersions from '../jira/fetchVersions';

/*
    Fetches all completed issues, per day from a team
*/
const getVersions = async (projectKey: string, jiraConfig: UserConfigJira) => {
  cli.log('Fetching versions for project: ' + projectKey);

  const projectVersions = await jiraFetchVersions(jiraConfig, projectKey);

  return projectVersions.map((v: any) => {
    return {
      ...v,
      releaseDate:
        v.releaseDate === undefined
          ? undefined
          : parse(v.releaseDate, 'yyyy-MM-dd', new Date()),
      projectKey: projectKey,
    };
  });
};

export default getVersions;
