import axios from 'axios';

import { UserConfigJira } from '../../global';

const paginateVersion = async (
  jiraConfig: UserConfigJira,
  projectKey: string,
  versions: Array<any>,
  startAt: number,
) => {
  const resultsCount = 100;
  console.log(`Fetching ${resultsCount} records from position: ${startAt}`);
  const response = await axios({
    method: 'get',
    url: `${jiraConfig.host}/rest/api/2/project/${projectKey}/version`,
    auth: {
      username: jiraConfig.username,
      password: jiraConfig.password,
    },
    params: {
      startAt: startAt,
      maxResults: resultsCount,
    },
  });
  if (response.data.values.length > 0) {
    versions = [...versions, ...response.data.values];
  }
  if (response.data.isLast === false) {
    const recVersions: any = await paginateVersion(
      jiraConfig,
      projectKey,
      versions,
      startAt + resultsCount,
    );
    return recVersions;
  }
  return versions;
};

const jiraFetchVersions = async (
  jiraConfig: UserConfigJira,
  projectKey: string,
) => {
  const versions = await paginateVersion(jiraConfig, projectKey, [], 0);
  return versions;
};

export default jiraFetchVersions;
