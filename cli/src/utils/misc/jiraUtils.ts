import { UserConfigJira } from '../../global';
const XRegExp = require('xregexp');

/*
    Delete un-necessary fields from the issue object
*/
export const cleanIssue = (issue: any, sprintField: string) => {
  if (issue.fields[sprintField] !== undefined) {
    issue.fields.sprint = getSprint(issue.fields[sprintField]);
  }

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

export const returnTicketsPoints = (issue: any, jiraConfig: UserConfigJira) => {
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

export const getSprint = (sprintField: string) => {
  let sprint: any = null;
  // if (issue.sprint.length > 0) {
  //   const sprintField = issue.sprint[0];
  const sprintSearch = XRegExp.exec(
    sprintField,
    XRegExp('(?<=name\\=)(.*)(?=,startDate)'),
  );
  if (sprintSearch !== null) {
    const sprintName = sprintSearch[0];
    sprint = { name: sprintName };

    const numberSearch = XRegExp.exec(sprintName, XRegExp('(?<=Sprint )(.*)'));
    if (numberSearch !== null) {
      sprint['number'] = numberSearch[0];
    }

    const startSearch = XRegExp.exec(
      sprintField,
      XRegExp('(?<=startDate\\=)(.*)(?=,endDate)'),
    );
    if (startSearch !== null && startSearch[0] !== '<null>') {
      const startDate = startSearch[0];
      sprint['startDate'] = startDate;
    }
    const completedSearch = XRegExp.exec(
      sprintField,
      XRegExp('(?<=completeDate\\=)(.*)(?=,sequence)'),
    );
    if (completedSearch !== null && completedSearch[0] !== '<null>') {
      // console.log(completedSearch);
      const completedDate = completedSearch[0];
      sprint['completedDate'] = completedDate;
    }
  }
  return sprint;
};
