export const getProgress = (issue: any, metric: string) => {
  let progressPrct = 0;
  if (issue.metrics[metric].total > 0) {
    progressPrct =
      Math.round(
        ((issue.metrics[metric].completed * 100) /
          issue.metrics[metric].total) *
          10,
      ) / 10;
  }
  return {
    completed: issue.metrics[metric].completed,
    total: issue.metrics[metric].total,
    progress: progressPrct,
  };
};

export const getEstimateState = (initiative: any) => {
  let estimatedPrct = 100;
  if (initiative.metrics.points.missing > 0) {
    estimatedPrct =
      Math.round(
        (((initiative.metrics.issues.total -
          initiative.metrics.points.missing) *
          100) /
          initiative.metrics.issues.total) *
          10,
      ) / 10;
  }
  return {
    esimtated:
      initiative.metrics.issues.total - initiative.metrics.points.missing,
    total: initiative.metrics.issues.total,
    progress: estimatedPrct,
  };
};

export const getBarVariant = (progress: number, missingEffort: number) => {
  if (progress === 100) {
    return 'success';
  }
  if (missingEffort > 0) {
    return 'warning';
  }
  return undefined;
};

export const getId = (inputstring: string) => {
  return String(inputstring)
    .replace(/[^a-z0-9+]+/gi, '')
    .toLowerCase();
};
