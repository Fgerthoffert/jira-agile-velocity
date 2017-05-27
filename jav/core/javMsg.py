import slackweb

class Msg(object):
    ''' 
        Display messages to console or send to slack depending of the user selected mode
    '''

    def __init__(self, log, config, dry_run):
        self.log = log
        self.config = config
        self.dry_run = dry_run
        if self.dry_run == False:
            self.slack = slackweb.Slack(url=self.config.get_config_value('slack_webhook'))

    def publish(self, remaining_work, tabulate_remaining, tabulate_days, tabulate_weeks):
        self.slackMsg('Good morning everyone, here are the latest _(non-mobile friendly)_ velocity stats, live from Jira')
        self.slackMsg('All Time values calculated over a period of *' + str(self.config.get_config_value('history_weeks')) + '* weeks')
        self.slackMsg('*Estimated remaining work*')
        self.slackMsg('Remaining story points: *' + str(remaining_work["points"]) + '*')
        self.slackMsg('```' + tabulate_remaining + '```')
        self.slackMsg('*This week\'s velocity*')
        self.slackMsg('```' + tabulate_days + ' ```')
        self.slackMsg('*Past weeks velocity*')
        self.slackMsg('```' + tabulate_weeks + ' ```')

    def slackMsg(self, msg):
        self.log.info(msg)
        if self.dry_run == False:
            self.slack.notify(text=msg, channel=self.config.get_config_value('slack_channel'))

