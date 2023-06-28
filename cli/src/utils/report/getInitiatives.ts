import { UserConfig } from '../../global';

export const getInitiatives = (
  teams: any,
  initiativesSourceTickets: any,
  userConfig: UserConfig,
) => {
  let initiativesIssues: any = [];
  for (const team of teams) {
    // Build an array of initiative issues
    const initiatives = team.forecast.find((f: any) => f.key === 'initiatives');
    if (initiatives !== undefined) {
      for (const issue of initiatives.issues) {
        const sourceIssue = initiativesSourceTickets.find(
          (i: any) => i.key === issue.key,
        );
        if (
          sourceIssue !== undefined &&
          !initiativesIssues.map((i: any) => i.key).includes(issue.key)
        ) {
          initiativesIssues.push({ ...issue, jira: sourceIssue });
        }
      }
    }
  }

  initiativesIssues = initiativesIssues
    .map((i: any) => {
      let expectedDelivery = 'N/A';
      if (i.jira.fields[userConfig.jira.fields.expectedDelivery] !== null) {
        expectedDelivery =
          i.jira.fields[userConfig.jira.fields.expectedDelivery];
      }
      return {
        ...i,
        expectedDelivery,
      };
    })
    .sort((a: any, b: any) =>
      a.expectedDelivery > b.expectedDelivery
        ? 1
        : b.expectedDelivery > a.expectedDelivery
        ? -1
        : 0,
    );

  return initiativesIssues;
};
