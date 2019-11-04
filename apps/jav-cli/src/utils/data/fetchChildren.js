"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line: file-name-casing
const cli_ux_1 = require("cli-ux");
const fs = require("fs");
const path = require("path");
const fsNdjson = require("fs-ndjson");
const searchIssues_1 = require("../jira/searchIssues");
const jiraUtils_1 = require("../misc/jiraUtils");
const returnTicketsPoints = (issue, config) => {
    if (issue.fields[config.jira.fields.points] !== undefined &&
        issue.fields[config.jira.fields.points] !== null) {
        return issue.fields[config.jira.fields.points];
    }
    if (issue.fields[config.jira.fields.originalPoints] !== undefined &&
        issue.fields[config.jira.fields.originalPoints] !== null) {
        return issue.fields[config.jira.fields.originalPoints];
    }
    return 0;
};
/*
    Fetches all initiatives
*/
const fetchChildren = async (userConfig, issueKey, cacheDir, useCache) => {
    cli_ux_1.default.action.start('Fetching children of: ' + issueKey);
    let issues = [];
    // If cache is enabled we don't fetch initiatives twice on the same day
    const today = new Date();
    const childrenCache = path.join(cacheDir, 'roadmap-childcache-' +
        issueKey +
        '-' +
        today.toJSON().slice(0, 10) +
        '.ndjson');
    if (useCache && fs.existsSync(childrenCache)) {
        issues = [...issues, fsNdjson.readFileSync(childrenCache)];
    }
    else {
        const issuesJira = await searchIssues_1.default(userConfig.jira, 'issuekey in childIssuesOf(' + issueKey + ')', 'summary,status,assignee,' +
            userConfig.jira.fields.points +
            ',' +
            userConfig.jira.fields.originalPoints +
            ',issuetype,' +
            userConfig.jira.fields.parentInitiative +
            ',' +
            userConfig.jira.fields.parentEpic);
        const issueFileStream = fs.createWriteStream(childrenCache, {
            flags: 'w'
        });
        for (const issue of issuesJira) {
            const updatedIssue = Object.assign(Object.assign({}, issue), { host: userConfig.jira.host, 
                //jql: 'issuekey in childIssuesOf(' + issueKey + ')',
                points: returnTicketsPoints(issue, userConfig) });
            issueFileStream.write(JSON.stringify(jiraUtils_1.cleanIssue(updatedIssue)) + '\n');
            issues.push(jiraUtils_1.cleanIssue(updatedIssue));
        }
        issueFileStream.end();
    }
    cli_ux_1.default.action.stop(' done');
    return issues;
};
exports.default = fetchChildren;
//# sourceMappingURL=fetchChildren.js.map