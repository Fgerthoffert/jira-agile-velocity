// tslint:disable-next-line: file-name-casing

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
  return issue;
};
