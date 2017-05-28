import slackweb


class Msg(object):
    """ 
        Display messages to console or send to slack depending of the user selected mode
    """

    def __init__(self, log, config, dry_run):
        self.log = log
        self.config = config
        self.dry_run = dry_run
        if not self.dry_run:
            self.slack = slackweb.Slack(url=self.config.get_config_value('slack_webhook'))

    def publish(self, remaining_work, tabulate_remaining, tabulate_days, tabulate_weeks):
        self.slack_msg(
            'Good morning everyone, here are the latest _(non-mobile friendly)_ velocity stats, live from Jira')
        self.slack_msg('All Time values calculated over a period of *' + str(
            self.config.get_config_value('history_weeks')) + '* weeks')
        self.slack_msg('*Estimated remaining work*')
        self.slack_msg('Remaining story points: *' + str(remaining_work["points"]) + '*')
        self.slack_msg('```' + tabulate_remaining + '```')
        self.slack_msg('*This week\'s velocity*')
        self.slack_msg('```' + tabulate_days + ' ```')
        self.slack_msg('*Past weeks velocity*')
        self.slack_msg('```' + tabulate_weeks + ' ```')

    def slack_msg(self, msg):
        self.log.info(msg)
        if not self.dry_run:
            self.slack.notify(text=msg, channel=self.config.get_config_value('slack_channel'))
