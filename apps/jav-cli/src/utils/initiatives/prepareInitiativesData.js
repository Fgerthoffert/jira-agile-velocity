"use strict";
// tslint:disable-next-line: file-name-casing
Object.defineProperty(exports, "__esModule", { value: true });
const crunchMetrics_1 = require("./crunchMetrics");
const crunchWeeks_1 = require("./crunchWeeks");
const prepareInitiativesData = (issuesTree, node, level, closedIssues, emptyCalendar, userConfig) => {
    if (node.key !== undefined) {
        node.level = level;
        node.metrics = crunchMetrics_1.default(issuesTree, node);
        node.isLeaf = issuesTree.hasChildren(node) ? false : true;
        node.weeks = Object.values(crunchWeeks_1.default(issuesTree, node, closedIssues, emptyCalendar, userConfig));
    }
    for (const children of issuesTree.childrenIterator(node)) {
        prepareInitiativesData(issuesTree, children, level + 1, closedIssues, emptyCalendar, userConfig);
    }
    return [];
};
exports.default = prepareInitiativesData;
//# sourceMappingURL=prepareInitiativesData.js.map