/* eslint max-depth: ["error", 7] */
/* eslint max-params: ["error", 7] */
/* eslint-env es6 */

import cli from 'cli-ux';
import * as fs from 'fs';
import * as path from 'path';
import * as fsNdjson from 'fs-ndjson';
import { parse } from 'date-fns';

import { IJiraIssue, UserConfigTeam, UserConfigJira } from '../../global';
import jiraFetchVersions from '../jira/fetchVersions';
import { formatDate, getDaysBetweenDates } from '../misc/dateUtils';
import { differenceInBusinessDays, startOfDay } from 'date-fns';
import { getTeamId } from '../misc/teamUtils';
import { getId } from '../misc/id';
import { returnTicketsPoints } from '../misc/jiraUtils';

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
        v.releaseDate !== undefined
          ? parse(v.releaseDate, 'yyyy-MM-dd', new Date())
          : undefined,
      projectKey: projectKey,
    };
  });
};

export default getVersions;
