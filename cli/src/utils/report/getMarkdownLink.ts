export const getMarkdownLink = (text: string) => {
  // https://stackoverflow.com/questions/27981247/github-markdown-same-page-link
  let textManipulations = text.toLowerCase();
  textManipulations = textManipulations.trim();
  textManipulations = textManipulations.replace(/\s/g, '-');
  return textManipulations;
};
