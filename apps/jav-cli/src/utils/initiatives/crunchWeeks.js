"use strict";
// tslint:disable-next-line: file-name-casing
Object.defineProperty(exports, "__esModule", { value: true });
const dateUtils_1 = require("../misc/dateUtils");
const crunchWeeks = (issuesTree, node, closedIssues, emptyCalendar, userConfig) => {
    return issuesTree.treeToArray(node).reduce((acc, item) => {
        const issueExist = closedIssues.find(i => i.key === item.key);
        if (issueExist !== undefined) {
            const firstDayWeekDate = dateUtils_1.startOfWeek(new Date(issueExist.closedAt));
            const firstDayWeekKey = firstDayWeekDate.toJSON().slice(0, 10);
            acc[firstDayWeekKey].list.push(issueExist);
            acc[firstDayWeekKey].issues.count = acc[firstDayWeekKey].list.length;
            if (issueExist.fields[userConfig.jira.fields.points] !== undefined &&
                issueExist.fields[userConfig.jira.fields.points] !== null) {
                acc[firstDayWeekKey].points.count = acc[firstDayWeekKey].list
                    .filter((issue) => (issue.fields[userConfig.jira.fields.points] !== undefined &&
                    issue.fields[userConfig.jira.fields.points] !== null) ||
                    (issue.fields[userConfig.jira.fields.originalPoints] !==
                        undefined &&
                        issue.fields[userConfig.jira.fields.originalPoints] !== null))
                    .map((issue) => {
                    if (issue.fields[userConfig.jira.fields.points] !== undefined &&
                        issue.fields[userConfig.jira.fields.points] !== null) {
                        return issue.fields[userConfig.jira.fields.points];
                    }
                    else {
                        return issue.fields[userConfig.jira.fields.originalPoints];
                    }
                })
                    .reduce((acc, points) => acc + points, 0);
            }
        }
        return acc;
    }, JSON.parse(JSON.stringify(emptyCalendar)));
};
exports.default = crunchWeeks;
//# sourceMappingURL=crunchWeeks.js.map