import { cli } from 'cli-ux';
import * as path from 'path';
import * as fs from 'fs';

import { UserConfigJira, IssueObjChild } from '../../global';
import jiraSearchIssues from '../jira/searchIssues';
import { getId } from '../misc/id';

interface JiraIssue {
  expand: string;
  id: string;
  self: string;
  key: string;
}

// Taking a query such as `type = Initiative`,
// this will return all issue key matching this query and
// all children of tickets in this query
export const getChildrenKey = async (
  jiraConfig: UserConfigJira,
  jql: string,
  cacheDir: string,
  useCache = false,
) => {
  const issueKeys: Array<IssueObjChild> = [];
  const cachePath = path.join(cacheDir, 'children');
  const cacheFile = path.join(
    cachePath,
    `${getId(jql)}-${new Date().toJSON().slice(0, 10)}.json`,
  );

  fs.mkdirSync(cachePath, { recursive: true });

  if (useCache === true && fs.existsSync(cacheFile)) {
    cli.log(`Getting issues from cache: ${cacheFile}`);
    const cacheData = fs.readFileSync(cacheFile, {
      encoding: 'utf8',
      flag: 'r',
    });
    const issueKeys = JSON.parse(cacheData);
    console.log(`Collected: ${issueKeys.length} issues from cache`);
    return issueKeys;
  }

  cli.log(`Collecting children using JQL: ${jql} issues`);

  const issuesJira = await jiraSearchIssues(jiraConfig, jql, 'key,summary');
  if (issuesJira.length === 0) {
    return [];
  }

  cli.log(`Will be collecting children of: ${issuesJira.length} issues`);
  for (const si of issuesJira) {
    if (issueKeys.find(i => i.key === si.key) === undefined) {
      issueKeys.push({ key: si.key, parent: { key: '', summary: '' } });
    }

    // Get all child issues for issues returned in the first query
    cli.action.start(`Fetching child issues of: ${si.key}`);
    const childIssues = await jiraSearchIssues(
      jiraConfig,
      'issuekey in childIssuesOf(' + si.key + ')',
      'key',
    );

    if (childIssues.length > 0) {
      cli.action.stop(` done - ${childIssues.length} issues`);
      for (const ckey of childIssues.map((i: JiraIssue) => i.key)) {
        if (issueKeys.find(i => i.key === ckey) === undefined) {
          issueKeys.push({
            key: ckey,
            parent: { key: si.key, summary: si.fields.summary },
          });
        }
      }
    } else {
      cli.action.stop(` done - 0 issues`);
    }
  }

  console.log(`Fetched: ${issueKeys.length} issues`);

  console.log(`Saving data to cache: ${cacheFile}`);
  const controlFileStream = fs.createWriteStream(cacheFile, {
    encoding: 'utf8',
    flags: 'w',
  });
  controlFileStream.write(JSON.stringify(issueKeys));
  controlFileStream.end();

  return issueKeys;
};
