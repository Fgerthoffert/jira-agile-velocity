import { format } from 'date-fns';

import { getCompletionStreams } from '../velocity/getCompletionStreams';
import { getStreamsDistribution } from '../velocity/getStreamsDistribution';
import { UserConfig } from '../../global';

export const createDistributionTable = (teams: any, userConfig: UserConfig) => {
  let distributionTable = '';
  let reportDate = '';

  for (const team of teams) {
    let completionStreams = getCompletionStreams(team, 6);
    completionStreams = getStreamsDistribution(completionStreams);

    if (distributionTable === '') {
      distributionTable = `| Team | Velocity (Pts) | Velocity (Tkts) | ${completionStreams
        .map(s => s.name)
        .join(' | ')} | \n`;
      distributionTable += `| --- | --- | --- | ${completionStreams
        .map(s => '---')
        .join(' | ')} | \n`;
    }

    const lastWeek: any = completionStreams[0].weeks.slice(-2)[1];
    // const lastWeek = completionStreams[0].weeks[completionStreams[0].weeks - 1]
    distributionTable += `| ${team.name} | ${Math.round(
      lastWeek.metrics.points.totalStreams,
    )} | ${Math.round(
      lastWeek.metrics.issues.totalStreams,
    )} | ${completionStreams
      .map(cs => {
        const lastWeek: any = cs.weeks.slice(-3)[2];
        const lastWeekDistribution: number =
          lastWeek.metrics.points.distribution;
        const earlierWeek: any = cs.weeks.slice(-3)[0];
        const earlierWeekDistribution: number =
          earlierWeek.metrics.points.distribution;
        let variance = '';
        if (lastWeekDistribution > earlierWeekDistribution + 5) {
          variance = `↗️ _(${Math.round(earlierWeekDistribution)}%)_`;
        } else if (lastWeekDistribution < earlierWeekDistribution - 5) {
          variance = `↘️ _(${Math.round(earlierWeekDistribution)}%)_`;
        }
        return `[${Math.round(lastWeekDistribution)}%](${encodeURI(
          `${
            userConfig.jira.host
          }/issues/?jql=key in (${lastWeek.velocity.issues
            .map((i: any) => i.key)
            .join()})`,
        )}) ${variance}`;
      })
      .join(' | ')} | \n`;

    const earlierWeek: any = completionStreams[0].weeks.slice(-3)[0];
    reportDate = format(earlierWeek.firstDay, 'LLLL dd, yyyy');
  }

  distributionTable += `\n`;
  distributionTable += `<sub>ℹ️ Displays team metrics as well as the distribution of its completion in various areas. Velocity is expressed per week.</sub> \n`;
  distributionTable += `<sub>ℹ️ ↗️ or ↘️ Indicates variation greater than 5% when compared to the week of ${reportDate}. Value from the week of ${reportDate} in between "()"</sub> \n`;

  return distributionTable;
};
