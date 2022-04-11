import { IConfigJira } from '../../global';

/*
    Delete un-necessary fields from the issue object
*/
export const cleanIssue = (issue: any) => {
  if (issue.expand !== undefined) {
    delete issue.expand;
  }
  if (issue.self !== undefined) {
    delete issue.self;
  }
  if (issue.host !== undefined) {
    delete issue.host;
  }
  if (issue.jql !== undefined) {
    delete issue.jql;
  }
  if (issue.fields.issuetype !== undefined) {
    delete issue.fields.issuetype.self;
    delete issue.fields.issuetype.id;
    delete issue.fields.issuetype.description;
    delete issue.fields.issuetype.subtask;
    delete issue.fields.issuetype.avatarId;
  }
  if (issue.fields.status !== undefined) {
    delete issue.fields.status.self;
    delete issue.fields.status.id;
    delete issue.fields.status.description;
    delete issue.fields.status.statusCategory.self;
    delete issue.fields.status.statusCategory.id;
    delete issue.fields.status.statusCategory.key;
    delete issue.fields.status.statusCategory.colorName;
  }
  return issue;
};

export const returnTicketsPoints = (issue: any, jiraConfig: IConfigJira) => {
  if (
    issue.fields[jiraConfig.fields.points] !== undefined &&
    issue.fields[jiraConfig.fields.points] !== null
  ) {
    return issue.fields[jiraConfig.fields.points];
  }
  if (
    issue.fields[jiraConfig.fields.originalPoints] !== undefined &&
    issue.fields[jiraConfig.fields.originalPoints] !== null
  ) {
    return issue.fields[jiraConfig.fields.originalPoints];
  }
  return 0;
};
