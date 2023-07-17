import { UserConfig } from '../../global';
import { getEstimated } from '../report/getEstimated';
import { getEstimatedHtml } from '../report/getEstimatedHtml';
import { getMarkdownLink } from '../report/getMarkdownLink';
import { getSpikesHtml } from './getSpikesHtml';

export const createInitiativesOverviewTable = (
  initiatives: any,
  userConfig: UserConfig,
) => {
  let iTable = '';
  iTable += `<table> \n`;
  iTable += `<th> \n`;
  iTable += `<td>Owner</td> \n`;
  iTable += `<td>Delivery</td> \n`;
  iTable += `<td>Progress</td> \n`;
  iTable += `<td>Estimated (Tkts)</td> \n`;
  iTable += `<td>Status</td> \n`;
  iTable += `</th> \n`;

  for (const i of initiatives) {
    let progessPtsPrct = 0;
    if (i.metrics.points.completed > 0) {
      progessPtsPrct = Math.round(
        (i.metrics.points.completed * 100) / i.metrics.points.total,
      );
    }
    const progessPts = `${progessPtsPrct}% (${i.metrics.points.completed}/${i.metrics.points.total})`;

    let progessTktsPrct = 0;
    if (i.metrics.issues.completed > 0) {
      progessTktsPrct = Math.round(
        (i.metrics.issues.completed * 100) / i.metrics.issues.total,
      );
    }
    const progessTkts = `${progessTktsPrct}% (${i.metrics.issues.completed}/${i.metrics.issues.total})`;
    iTable += `<tr> \n`;
    iTable += `<td rowspan="2"><a href="${userConfig.jira.host}/browse/${i.key}" target="_blank">${i.key}</a></td> \n`;
    iTable += `<td colspan="6">${i.summary}</td> \n`;
    iTable += `</tr> \n`;
    iTable += `<tr> \n`;
    iTable += `<td>${
      i.assignee === undefined || i.assignee === null
        ? 'ALL'
        : i.assignee.name.replace('team-', '')
    }</td> \n`;
    iTable += `<td> ${i.expectedDelivery === undefined ? 'n/a' : i.expectedDelivery}</td> \n`;
    iTable += `<td>${progessPts} Pts <br /> ${progessTkts} Tkts</td> \n`;
    iTable += `<td>${getEstimatedHtml(i, userConfig)} <br /> ${getSpikesHtml(i, userConfig)}</td> \n`;
    iTable += `<td>${
      i.status.name
    }</td> \n`;
    iTable += `</tr> \n`;   
  }

  iTable += `</table> \n`;
  iTable += `\n`;
  iTable += `<sub>ℹ️ Displays initiatives with the "delivery-report" label.</sub> \n`;
  iTable += `\n`;

  return iTable;
};
