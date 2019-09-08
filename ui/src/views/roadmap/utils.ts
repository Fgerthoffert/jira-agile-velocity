export const getProgress = (issue: any, metric: string) => {
  let progressPrct = 0;
  if (issue.metrics[metric].total > 0) {
    progressPrct =
      Math.round(
        ((issue.metrics[metric].completed * 100) /
          issue.metrics[metric].total) *
          10
      ) / 10;
  }
  return {
    completed: issue.metrics[metric].completed,
    total: issue.metrics[metric].total,
    progress: progressPrct
  };
};

export const getBarVariant = (progress: number, missingEffort: number) => {
  if (progress === 100) {
    return 'success';
  } else if (progress === 100 && missingEffort > 0) {
    return 'warning';
  }
  return undefined;
};
