/* eslint max-depth: ["error", 7] */
/* eslint max-params: ["error", 7] */
/* eslint-env es6 */

import { IJiraIssue } from '../../global';

/*
    Trim issues to keep only the most important details
*/
const trimIssues = (issues: Array<IJiraIssue>) => {
  return issues.map(issue => {
    const trimmedIssue: any = {};
    if (issue.key !== undefined) {
      trimmedIssue.key = issue.key;
    }
    if (issue?.fields?.summary !== undefined) {
      trimmedIssue.summary = issue.fields.summary;
    }
    if (issue?.fields?.created !== undefined) {
      trimmedIssue.created = issue.fields.created;
    }
    if (issue?.fields?.labels !== undefined) {
      trimmedIssue.labels = issue.fields.labels;
    }
    if (issue?.fields?.status !== undefined) {
      trimmedIssue.status = issue.fields.status.name;
    }
    if (
      issue?.fields?.priority !== undefined &&
      issue?.fields?.priority !== null
    ) {
      trimmedIssue.priority = issue.fields.priority.name;
    }
    if (issue?.fields?.project !== undefined) {
      trimmedIssue.projectKey = issue.fields.project.key;
    }
    if (issue?.points !== undefined) {
      trimmedIssue.points = issue.points;
    }
    if (issue?.daysToRelease !== undefined) {
      trimmedIssue.daysToRelease = issue.daysToRelease;
    }
    if (issue?.weeksToRelease !== undefined) {
      trimmedIssue.weeksToRelease = issue.weeksToRelease;
    }
    if (issue?.monthsToRelease !== undefined) {
      trimmedIssue.monthsToRelease = issue.monthsToRelease;
    }
    if (issue?.daysToReleaseIfToday !== undefined) {
      trimmedIssue.daysToReleaseIfToday = issue.daysToReleaseIfToday;
    }
    if (issue?.weeksToReleaseIfToday !== undefined) {
      trimmedIssue.weeksToReleaseIfToday = issue.weeksToReleaseIfToday;
    }
    if (issue?.monthsToReleaseIfToday !== undefined) {
      trimmedIssue.monthsToReleaseIfToday = issue.monthsToReleaseIfToday;
    }
    if (issue?.daysToResolution !== undefined) {
      trimmedIssue.daysToResolution = issue.daysToResolution;
    }
    if (issue?.weeksToResolution !== undefined) {
      trimmedIssue.weeksToResolution = issue.weeksToResolution;
    }
    if (issue?.monthsToResolution !== undefined) {
      trimmedIssue.monthsToResolution = issue.monthsToResolution;
    }
    if (issue?.fields?.issuetype !== undefined) {
      trimmedIssue.type = issue.fields.issuetype.name;
    }
    if (issue?.fields?.resolutiondate !== undefined) {
      trimmedIssue.resolutiondate = issue.fields.resolutiondate;
    }
    if (
      issue?.fields?.resolution !== undefined &&
      issue?.fields?.resolution !== null
    ) {
      trimmedIssue.resolution = issue.fields.resolution.name;
    }
    return trimmedIssue;
  });
};

export default trimIssues;
