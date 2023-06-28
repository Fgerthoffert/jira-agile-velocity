import { UserConfig } from '../../global';
import { getEstimated } from '../report/getEstimated';
import { getMarkdownLink } from '../report/getMarkdownLink';

export const createInitiativesOverviewTable = (
  initiatives: any,
  userConfig: UserConfig,
) => {
  let iTable = '';
  iTable += `| Title | Team | Delivery | Status |Progress (Pts) | Progress (Tkts) | Estimated (Tkts) | Ticket | \n`;
  iTable += `| --- | --- | --- | --- | --- | --- | --- | --- | \n`;
  // Loop through initiatives sorted by delivery date
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

    iTable += `| [${i.summary}](#${getMarkdownLink(i.summary)}) |  ${
      i.assignee === undefined || i.assignee === null
        ? 'ALL'
        : i.assignee.name.replace('team-', '')
    } | ${i.expectedDelivery} | ${
      i.status.name
    } | ${progessPts} | ${progessTkts} | ${getEstimated(i, userConfig)} | [${
      i.key
    }](${userConfig.jira.host}/browse/${i.key}) | \n`;
  }
  iTable += `\n`;
  iTable += `<sub>ℹ️ Displays initiatives with the "delivery-report" label.</sub> \n`;
  iTable += `\n`;
  return iTable;
};
