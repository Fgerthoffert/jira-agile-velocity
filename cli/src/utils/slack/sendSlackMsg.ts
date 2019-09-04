import * as slack from "slack";

const sendSlackMsg = (token: string, channel: string, text: string) => {
  slack.chat.postMessage({ token, channel, text });
};

export default sendSlackMsg;
