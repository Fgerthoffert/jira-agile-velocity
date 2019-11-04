export const fetchGraphIssues = (initiative: any) => {
  const individualIssues: any[] = [
    {
      id: initiative.id,
      group: 'nodes',
      label: initiative.fields.summary,
      data: {
        ...initiative,
        distance: 0,
        status: initiative.fields.status.name,
        type: initiative.fields.issuetype.name,
        points: initiative.metrics.points.total
      }
    }
  ];
  const distance = 0;
  return exploreGraph(initiative, individualIssues, distance);
};

const exploreGraph = (
  parentIssue: any,
  individualIssues: any[],
  distance: number
) => {
  parentIssue.children.forEach((childrenIssue: any) => {
    const node: any = {
      id: childrenIssue.id,
      label: childrenIssue.fields.summary,
      group: 'nodes',
      data: {
        ...childrenIssue,
        distance: distance + 1,
        status: childrenIssue.fields.status.statusCategory.name,
        type: childrenIssue.fields.issuetype.name,
        points: childrenIssue.metrics.points.total
      }
    };
    individualIssues.push(node);
    if (
      childrenIssue.children !== undefined &&
      childrenIssue.children.length > 0
    ) {
      exploreGraph(childrenIssue, individualIssues, distance);
    }
  });
  return individualIssues;
};
