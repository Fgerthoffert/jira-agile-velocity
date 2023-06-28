import { format } from 'date-fns';

import { UserConfig } from '../../global';
import { cleanIssue } from '../misc/jiraUtils';

export const createReleasePipelineTable = (
  releaseTickets: any,
  userConfig: UserConfig,
) => {
  let releaseTable = '';
  releaseTable += `| Release | Status | Sprint | Released date | Ticket | \n`;
  releaseTable += `| --- | --- | --- | --- | --- | \n`;
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
    for (const fixVersion of fixVersions) {
      releaseTable += `| ${fixVersion} | ${releaseTicket.fields.status.name} | ${sprint} | ${resolutionDate} | [${releaseTicket.key}](${userConfig.jira.host}/browse/${releaseTicket.key}) | \n`;
    }
  }
  releaseTable += `\n`;
  releaseTable += `<sub>ℹ️ Displays releases in the current sprint or planned in future sprints as well as releases completed in the past 30 days.</sub> \n`;
  return releaseTable;
};
