// tslint:disable-next-line: file-name-casing
export const getNonInitiativeTitle = () => {
  return 'Orphaned Tickets';
};

export const getInitiativeTitle = (initiative: any) => {
  const maxTitleLength = 30;
  const initiativeTitle =
    initiative.summary.length > maxTitleLength
      ? initiative.summary.slice(0, maxTitleLength) + '...'
      : initiative.summary;
  return initiativeTitle + ' (' + initiative.key + ')';
};

/*
tbc
*/
export const getCellDataInitiatives = (
  initiative: string,
  weekTxt: string,
  roadmap: any,
) => {
  if (initiative !== getNonInitiativeTitle()) {
    return roadmap.initiatives
      .find((i: any) => getInitiativeTitle(i) === initiative)
      .weeks.find((w: any) => w.weekTxt === weekTxt).list;
  } else {
    return roadmap.orphanIssues.find((w: any) => w.weekTxt === weekTxt).list;
  }
};

/* 
    Display different background colors based on the percentage of the effort spent on a particular activity for a week
  */
export const getCompletionColor = (data: any, value: any, dataset: any) => {
  let prct = 0;
  const weekCompletion = dataset
    .map((row: any) => row[data.xKey])
    .reduce((acc: number, count: number) => acc + count, 0);
  if (weekCompletion > 0) {
    prct = Math.round((value * 100) / weekCompletion);
  }

  if (prct < 20) {
    return 'rgb(247, 252, 185)';
  } else if (prct >= 20 && prct < 40) {
    return 'rgb(217, 240, 163)';
  } else if (prct >= 40 && prct < 60) {
    return 'rgb(173, 221, 142)';
  } else if (prct >= 60 && prct < 80) {
    return 'rgb(120, 198, 121)';
  }
  return 'rgb(65, 171, 93)';
};
