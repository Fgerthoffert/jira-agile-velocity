// tslint:disable-next-line: file-name-casing
import axios from 'axios';

import { IConfigJira } from '../../global';

const jiraSearchIssues = async (
  jiraConfig: IConfigJira,
  jqlQuery: string,
  field: string
) => {
  const response = await axios({
    method: 'get',
    url: jiraConfig.host + '/rest/api/2/search',
    auth: {
      username: jiraConfig.username,
      password: jiraConfig.password
    },
    params: {
      jql: jqlQuery,
      startAt: 0,
      maxResults: 1500,
      fields: field
    }
  });
  if (response.data.issues.length > 0) {
    return response.data.issues;
  }
  return [];
};

export default jiraSearchIssues;
