import { format } from 'date-fns';

import { UserConfig } from '../../global';
import { getEstimated } from '../report/getEstimated';

export const createInitiativeDetails = (
  initiative: any,
  userConfig: UserConfig,
) => {
  let initiativeDetails = '';
  let deliveryConfidence = 'N/A';
  if (
    initiative.jira.fields[userConfig.jira.fields.deliveryConfidence] !==
      undefined &&
    initiative.jira.fields[userConfig.jira.fields.deliveryConfidence] !== null
  ) {
    deliveryConfidence =
      initiative.jira.fields[userConfig.jira.fields.deliveryConfidence].value;
    if (deliveryConfidence.includes('HIGH')) {
      deliveryConfidence = `🟢 ${deliveryConfidence}`;
    } else if (deliveryConfidence.includes('MEDIUM')) {
      deliveryConfidence = `🟠 ${deliveryConfidence}`;
    } else if (deliveryConfidence.includes('LOW')) {
      deliveryConfidence = `🔴 ${deliveryConfidence}`;
    }
  }

  let expectedDelivery = 'N/A';
  if (
    initiative.jira.fields[userConfig.jira.fields.expectedDelivery] !==
      undefined &&
    initiative.jira.fields[userConfig.jira.fields.expectedDelivery] !== null
  ) {
    expectedDelivery =
      initiative.jira.fields[userConfig.jira.fields.expectedDelivery];
  }

  initiativeDetails += `## ${initiative.summary} \n`;
  initiativeDetails += `\n`;
  initiativeDetails += `* Ticket:  [${initiative.key}](${userConfig.jira.host}/browse/${initiative.key})  \n`;
  initiativeDetails += `* Status: ${initiative.status.name} \n`;
  initiativeDetails += `* Expected delivery: ${expectedDelivery} \n`;
  initiativeDetails += `* Delivery confidence: ${deliveryConfidence} \n`;
  initiativeDetails += `* Owners(s): ${
    initiative.assignee === undefined || initiative.assignee === null
      ? 'ALL'
      : initiative.assignee.name.replace('team-', '')
  } \n`;

  const issueComments = initiative.jira.fields.comment.comments.filter(
    (c: any) => !c.body.includes('#NO-REPORT'),
  );
  let reversedIssuesComments = [];
  if (issueComments.length > 0) {
    reversedIssuesComments = issueComments.slice().reverse();
    initiativeDetails += `#### 📅 ${format(
      new Date(reversedIssuesComments[0].created),
      'LLLL dd, yyyy HH:mm',
    )}  \n`;
    initiativeDetails += `\n`;
    initiativeDetails += `${reversedIssuesComments[0].body} \n`;
    initiativeDetails += `\n`;
  }

  if (initiative.children !== undefined && initiative.children.length > 0) {
    initiativeDetails += `### Children  \n`;
    initiativeDetails += `| Title | Progress (Pts) | Progress (Tkts) | Estimated (Tkts) | Ticket | \n`;
    initiativeDetails += `| --- | --- | --- | --- | --- | \n`;

    for (const initiativeChild of initiative.children) {
      let progessPtsPrct = 0;
      if (initiativeChild.metrics.points.completed > 0) {
        progessPtsPrct = Math.round(
          (initiativeChild.metrics.points.completed * 100) /
            initiativeChild.metrics.points.total,
        );
      }
      const progessPts = `${progessPtsPrct}% (${initiativeChild.metrics.points.completed}/${initiativeChild.metrics.points.total})`;

      let progessTktsPrct = 0;
      if (initiativeChild.metrics.issues.completed > 0) {
        progessTktsPrct = Math.round(
          (initiativeChild.metrics.issues.completed * 100) /
            initiativeChild.metrics.issues.total,
        );
      }
      const progessTkts = `${progessTktsPrct}% (${initiativeChild.metrics.issues.completed}/${initiativeChild.metrics.issues.total})`;

      initiativeDetails += `| ${
        initiativeChild.summary
      } | ${progessPts} | ${progessTkts} | ${getEstimated(
        initiativeChild,
        userConfig,
      )} | [${initiativeChild.key}](${userConfig.jira.host}/browse/${
        initiativeChild.key
      }) | \n`;
    }
  }

  if (issueComments.length > 0 && reversedIssuesComments.slice(1).length > 1) {
    initiativeDetails += `### Previous minutes  \n`;
    for (const comment of reversedIssuesComments.slice(1)) {
      initiativeDetails += `#### 📅 ${format(
        new Date(comment.created),
        'LLLL dd, yyyy HH:mm',
      )} \n`;
      initiativeDetails += `${comment.body} \n`;
      initiativeDetails += `\n`;
    }
  }

  return initiativeDetails;
};
