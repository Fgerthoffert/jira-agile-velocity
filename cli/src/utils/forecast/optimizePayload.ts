/*
  Contains a serie of method aimed at reducing the payload
*/
const simplifyAssignee = (issue: any) => {
  if (issue.fields.assignee !== null) {
    return {
      name: issue.fields.assignee.name,
      displayName: issue.fields.assignee.displayName,
    };
  }
  return null;
};

const simplifyIssue = (issue: any) => {
  return {
    id: issue.id,
    key: issue.key,
    summary: issue.fields.summary,
    priority:
      issue.fields.priority != undefined && issue.fields.priority !== null
        ? issue.fields.priority.name
        : '',
    created: issue.fields.created,
    closedAt: issue.closedAt,
    weekStart: issue.weekStart === undefined ? null : issue.weekStart,
    status: {
      name: issue.fields.status.name,
      category: issue.fields.status.statusCategory.name,
    },
    type: {
      name: issue.fields.issuetype.name,
      iconUrl: issue.fields.issuetype.iconUrl,
    },
    points: issue.points,
    metrics: issue.metrics === undefined ? null : issue.metrics,
    assignee: simplifyAssignee(issue),
  };
};

// Iteratively go through children to "simplify" them
const simplifyChildren = (issue: any) => {
  if (issue.isLeaf === true) {
    return simplifyIssue(issue);
  }
  return {
    ...simplifyIssue(issue),
    children: issue.children.map((i: any) => simplifyChildren(i)),
  };
};

const optimizePayload = (payload: any) => {
  return payload.map((issue: any) => {
    return {
      ...simplifyIssue(issue),
      metrics: issue.metrics,
      children: issue.children.map((c: any) => simplifyChildren(c)),
    };
  });
};

export default optimizePayload;
