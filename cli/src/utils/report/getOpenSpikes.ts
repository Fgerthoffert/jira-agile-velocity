// Returns the list of issues that are missing estimates
export const getOpenSpikes = (issue: any) => {
  let openSpikes: any = [];
  if (issue.children !== undefined && issue.children.length > 0) {
    for (const childIssue of issue.children) {
      const childopenSpikes = getOpenSpikes(childIssue);
      openSpikes = [...openSpikes, ...childopenSpikes];
    }
  } else if (issue.children === undefined || issue.children.length === 0) {
    if (issue.type.name === "Spike" && issue.status.category !== "Done") {
      openSpikes.push(issue);
    }
  }
  return openSpikes;
};
