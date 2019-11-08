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
    closedAt: issue.closedAt,
    weekStart: issue.weekStart !== undefined ? issue.weekStart : null,
    status: {
      name: issue.fields.status.name,
      category: issue.fields.status.statusCategory.name,
    },
    type: {
      name: issue.fields.issuetype.name,
      iconUrl: issue.fields.issuetype.iconUrl,
    },
    points: issue.points,
    metrics: issue.metrics !== undefined ? issue.metrics : null,
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
  const slimInitiatives = payload.initiatives.map((initiative: any) => {
    return {
      ...simplifyIssue(initiative),
      metrics: initiative.metrics,
      weeks: initiative.weeks
        .filter((w: any) => w.list.length > 0)
        .map((week: any) => {
          return {
            ...week,
            list: week.list.map((i: any) => simplifyIssue(i)),
          };
        }),
      children: initiative.children.map((c: any) => simplifyChildren(c)),
    };
  });

  const orphanIssues = payload.orphanIssues.map((week: any) => {
    return { ...week, list: week.list.map((i: any) => simplifyIssue(i)) };
  });

  const futureCompletion = payload.futureCompletion.map((initiative: any) => {
    return {
      ...simplifyIssue(initiative),
      team: initiative.team,
      metrics: initiative.metrics,
      weeks: initiative.weeks.filter(
        (w: any) => w.issues.count > 0 || w.points.count > 0,
      ),
    };
  });

  return {
    ...payload,
    initiatives: slimInitiatives,
    orphanIssues: orphanIssues,
    futureCompletion: futureCompletion,
  };
};

export default optimizePayload;
