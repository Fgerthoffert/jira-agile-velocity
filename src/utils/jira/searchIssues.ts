// tslint:disable-next-line: file-name-casing
import axios from "axios";

interface JiraConnection {
  jira_username: string;
  jira_password: string;
  jira_host: string;
}

const jiraSearchIssues = async (
  jiraConnection: JiraConnection,
  jqlQuery: string,
  field: string
) => {
  const { jira_username, jira_password, jira_host } = jiraConnection;
  const response = await axios({
    method: "get",
    url: jira_host + "/rest/api/2/search",
    auth: {
      username: jira_username,
      password: jira_password
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
