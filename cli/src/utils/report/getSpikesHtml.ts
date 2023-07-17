import { getOpenSpikes } from '../report/getOpenSpikes';

export const getSpikesHtml = (initiativeIssue: any, userConfig: any) => {
  const openSpikes = getOpenSpikes(initiativeIssue);
  let openSpikesMsg = '';
  if (openSpikes.length > 0) {
    openSpikesMsg = `<a href="${encodeURI(
      `${userConfig.jira.host}/issues/?jql=key in (${openSpikes.map((i: any) => i.key).join()})`,
    )}">${
      openSpikes.length
    } Open spikes.</a>`;
  } else {
    openSpikesMsg = `0 Open spikes`
  }
  return `${openSpikesMsg}`;
};
