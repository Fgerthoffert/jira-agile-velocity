import { format } from 'date-fns';

import { UserConfig } from '../../global';
import { cleanIssue } from '../misc/jiraUtils';

export const createReleasePipelineTable = (
  releaseTickets: any,
  userConfig: UserConfig,
) => {
  let releaseTable = '';
  releaseTable += `| Release | Status | Sprint | Released date | Progress (Tkts) | Ticket | \n`;
  releaseTable += `| --- | --- | --- | --- | --- | --- | \n`;
  for (let releaseTicket of releaseTickets) {
    releaseTicket = cleanIssue(releaseTicket, userConfig.jira.fields.sprint);
    const sprint =
      releaseTicket.fields.sprint !== undefined &&
      releaseTicket.fields.sprint !== null
        ? releaseTicket.fields.sprint.map((s: any) => s.name).join(', ')
        : '';
    const fixVersions =
      releaseTicket.fields.fixVersions === undefined
        ? []
        : releaseTicket.fields.fixVersions.map((i: any) => i.name);
    let resolutionDate = '';
    if (
      releaseTicket.fields.resolutiondate !== undefined &&
      releaseTicket.fields.resolutiondate !== null
    ) {
      resolutionDate = format(
        new Date(releaseTicket.fields.resolutiondate),
        'LLLL dd, yyyy',
      );
    }
    const allIssues = releaseTicket.issuesInRelease;
    const completedIssues = releaseTicket.issuesInRelease.filter(
      (i: any) => i.status.statusCategory.name === 'Done',
    );
    let progessTktsPrct = 0;
    if (completedIssues.length > 0) {
      progessTktsPrct = Math.round(
        (completedIssues.length * 100) / allIssues.length,
      );
    }
    const progessTkts = `${progessTktsPrct}% ([${
      completedIssues.length
    }](${encodeURI(
      `${userConfig.jira.host}/issues/?jql=key in (${completedIssues
        .map((i: any) => i.key)
        .join()})`,
    )})/[${allIssues.length}](${encodeURI(
      `${userConfig.jira.host}/issues/?jql=key in (${allIssues
        .map((i: any) => i.key)
        .join()})`,
    )}))`;

    for (const fixVersion of fixVersions) {
      releaseTable += `| ${fixVersion} | ${releaseTicket.fields.status.name} | ${sprint} | ${resolutionDate} | ${progessTkts} | [${releaseTicket.key}](${userConfig.jira.host}/browse/${releaseTicket.key}) | \n`;
    }
  }
  releaseTable += `\n`;
  releaseTable += `<sub>ℹ️ Displays releases in the current sprint or planned in future sprints as well as releases completed in the past 30 days.</sub> \n`;
  return releaseTable;
};
