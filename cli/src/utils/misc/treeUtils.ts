

/*
    Export the tree in a nest object
*/
export const exportTree = (issuesTree: any, node: any) => {
  const jsonObject = [];
  for (const initiative of issuesTree.childrenIterator(node)) {
    const epics = [];
    for (const epic of issuesTree.childrenIterator(initiative)) {
      const stories = [];
      for (const story of issuesTree.childrenIterator(epic)) {
        stories.push(story);
      }
      epic.children = stories;
      epics.push(epic);
    }
    initiative.children = epics;
    jsonObject.push(initiative);
  }
  return jsonObject;
};
