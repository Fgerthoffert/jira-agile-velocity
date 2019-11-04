"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line: file-name-casing
const cli_ux_1 = require("cli-ux");
const fs = require("fs");
const path = require("path");
const fsNdjson = require("fs-ndjson");
const searchIssues_1 = require("../jira/searchIssues");
const teamUtils_1 = require("../misc/teamUtils");
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
const fetchInitiatives = async (userConfig, cacheDir, useCache) => {
    cli_ux_1.default.action.start('Fetching roadmap initiatives using: ' +
        userConfig.roadmap.jqlInitiatives +
        ' ');
    let issues = [];
    // If cache is enabled we don't fetch initiatives twice on the same day
    const today = new Date();
    const initiativesCache = path.join(cacheDir, 'roadmap-initiatives-' + today.toJSON().slice(0, 10) + '.ndjson');
    if (useCache && fs.existsSync(initiativesCache)) {
        issues = [...issues, fsNdjson.readFileSync(initiativesCache)];
    }
    else {
        const issuesJira = await searchIssues_1.default(userConfig.jira, userConfig.roadmap.jqlInitiatives, 'summary,status,' +
            userConfig.jira.fields.points +
            ',' +
            userConfig.jira.fields.originalPoints +
            ',issuetype,assignee');
        const issueFileStream = fs.createWriteStream(initiativesCache, {
            flags: 'w'
        });
        for (const issue of issuesJira) {
            const updatedIssue = Object.assign(Object.assign({}, issue), { host: userConfig.jira.host, jql: userConfig.roadmap.jqlInitiatives, team: teamUtils_1.getTeamFromAssignee(issue, userConfig.roadmap.teams), points: returnTicketsPoints(issue, userConfig) });
            issueFileStream.write(JSON.stringify(jiraUtils_1.cleanIssue(updatedIssue)) + '\n');
            issues.push(jiraUtils_1.cleanIssue(updatedIssue));
        }
        issueFileStream.end();
    }
    cli_ux_1.default.action.stop(' done');
    return issues;
};
exports.default = fetchInitiatives;
//# sourceMappingURL=fetchInitiatives.js.map