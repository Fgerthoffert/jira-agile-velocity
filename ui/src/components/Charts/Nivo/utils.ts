// tslint:disable-next-line: file-name-casing

/*
tbc
*/
export const getCellDataInitiatives = (
  initiative: string,
  weekTxt: string,
  roadmap: any,
  completionWeeks: any
) => {
  if (initiative !== getNonInitiativeTitle()) {
    return roadmap.byInitiative
      .find((i: any) => getInitiativeTitle(i) === initiative)
      .weeks.find((w: any) => w.weekTxt === weekTxt).list;
  } else {
    return completionWeeks[weekTxt].nonInitiativesList;
  }
};

export const getInitiativeTitle = (initiative: any) => {
  return initiative.fields.summary + ' (' + initiative.key + ')';
};

export const getNonInitiativeTitle = () => {
  return 'Other activities (not related to initiatives)';
};

/* 
    Display different background colors based on the percentage of the effort spent on a particular activity for a week
  */
export const getCompletionColor = (
  data: any,
  value: any,
  completionWeeks: any
) => {
  const prct = Math.round(
    (value * 100) / completionWeeks[data.xKey].totalCount
  );
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
