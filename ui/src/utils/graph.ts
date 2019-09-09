import InitiativeTable from '../views/roadmap/Completion/InitiativeTable';

/*
 *
 * fetchGraphIssues() Takes an array of issues, and walk the tree to find all possible issues associations
 *
 * Arguments:
 * - issues: Array of issues
 * - cfgIssues: Minimongo instance
 */
export const fetchGraphIssues = (initiative: any) => {
  console.log(initiative);
  const individualIssues: Array<any> = [
    {
      id: initiative.id,
      group: 'nodes',
      label: initiative.fields.summary,
      data: {
        ...initiative,
        distance: 0,
        status: initiative.fields.status.name
      }
    }
  ];
  const distance = 0;

  return exploreGraph(initiative, individualIssues, distance);

  /*
  issues.forEach(issue => {
    if (_.findIndex(individualIssues, { id: issue.id }) === -1) {
      const node = {
        id: issue.id,
        group: 'nodes',
        label: issue.title,
        data: {
          ...issue,
          distance: 0
        }
      };
      individualIssues.push(node);
      exploreGraph(issue, cfgIssues, individualIssues, distance);
    }
  });
  */
  //  return individualIssues;
};

const exploreGraph = (
  parentIssue: any,
  individualIssues: Array<any>,
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
        status: childrenIssue.fields.status.name
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

/*
const exploreGraph = (issue, cfgIssues, individualIssues, distance) => {
  const links = [...issue.linkedIssues.target, ...issue.linkedIssues.source];
  links.forEach(link => {
    if (_.findIndex(individualIssues, { id: link.id }) === -1) {
      let foundIssue = cfgIssues.findOne({ id: link.id });
      if (foundIssue === undefined) {
        foundIssue = { ...link, partial: true };
      }
      const node = {
        id: foundIssue.id,
        label: foundIssue.title,
        group: 'nodes',
        data: {
          ...foundIssue,
          distance: distance + 1
        }
      };
      individualIssues.push(node);
      // If issue isn't partial, we can go into finding the neighbors
      if (foundIssue.partial === undefined) {
        exploreGraph(foundIssue, cfgIssues, individualIssues, distance + 1);
      }
    }
  });
};
*/
