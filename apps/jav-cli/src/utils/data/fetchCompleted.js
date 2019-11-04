"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line: file-name-casing
const cli_ux_1 = require("cli-ux");
const fs = require("fs");
const path = require("path");
const fsNdjson = require("fs-ndjson");
const searchIssues_1 = require("../jira/searchIssues");
const dateUtils_1 = require("../misc/dateUtils");
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
    Fetches all completed issues, per day from a team
*/
const fetchCompleted = async (config, cacheDir, teamName) => {
    let issues = [];
    console.log('Fetching data for team: ' + teamName);
    const teamConfig = config.teams.find(t => t.name === teamName);
    if (teamConfig !== undefined) {
        const toDay = new Date();
        toDay.setDate(toDay.getDate() - 1);
        const dates = dateUtils_1.getDaysBetweenDates(dateUtils_1.formatDate(teamConfig.jqlHistory), toDay);
        for (const scanDay of dates) {
            const issuesDayFilepath = path.join(cacheDir, 'completed-' + teamUtils_1.getTeamId(teamName) + '-' + scanDay + '.ndjson');
            if (!fs.existsSync(issuesDayFilepath)) {
                cli_ux_1.default.action.start('Fetching data for day: ' + scanDay + ' to file: ' + issuesDayFilepath);
                const jqlQuery = teamConfig.jqlCompletion + ' ON(' + scanDay + ')';
                const issuesJira = await searchIssues_1.default(config.jira, jqlQuery, 'labels,summary,issuetype,assignee,' +
                    config.jira.fields.points +
                    ',' +
                    config.jira.fields.originalPoints);
                //Note: We'd still write an empty file to cache to record the fact that no issues were completed that day
                const issueFileStream = fs.createWriteStream(issuesDayFilepath, {
                    flags: 'a'
                });
                if (issuesJira.length > 0) {
                    for (const issue of issuesJira) {
                        // Adding a closedAt object to record the date at which the issue was actually closed
                        // Attaching points directly to the issues object to avoid having to bring jira-field config specific elements to the UI
                        const updatedIssue = jiraUtils_1.cleanIssue(Object.assign(Object.assign({}, issue), { closedAt: scanDay, team: teamName, 
                            //              host: config.jira.host,
                            points: returnTicketsPoints(issue, config) }));
                        issues.push(jiraUtils_1.cleanIssue(updatedIssue));
                        issueFileStream.write(JSON.stringify(updatedIssue) + '\n');
                    }
                }
                issueFileStream.end();
                cli_ux_1.default.action.stop(' done');
            }
            else {
                issues = [...issues, fsNdjson.readFileSync(issuesDayFilepath)];
            }
        }
    }
    return issues;
};
exports.default = fetchCompleted;
//# sourceMappingURL=fetchCompleted.js.map