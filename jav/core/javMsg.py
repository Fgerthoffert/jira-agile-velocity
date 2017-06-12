import slackweb


class Msg(object):
    """
        Display messages to console or send to slack depending of the user selected mode
    """

    def __init__(self, log, config, silent):
        self.log = log
        self.config = config
        self.__silent = silent
        if not self.silent:
            self.__slack = slackweb.Slack(url=self.config.get_config_value('slack_webhook'))

    @property
    def silent(self):
        return self.__silent

    @property
    def slack(self):
        return self.__slack

    def publish(self, stats_days, stats_weeks, stats_remaining):
        remaining = []
        for scan_day in stats_remaining:
            remaining = stats_remaining[scan_day]['days_to_completion']
            remaining_pts = stats_remaining[scan_day]['points']
            break
        for scan_day in stats_days:
            daily_velocity = stats_days[scan_day]
            daily_points = stats_days[scan_day]['points']
            day_txt = stats_days[scan_day]['daytxt']
            break
        for scan_week in stats_weeks:
            week_txt = stats_weeks[scan_week]['weektxt']
            weekly_velocity = stats_weeks[scan_week]['stats']
            weekly_points = stats_weeks[scan_week]['points']
            break

        self.slack_msg('Hello everyone, here are your velocity stats, <' + self.config.get_config_value('git_pageurl') + '|live from Jira>.')
        self.slack_msg('Remaining story points: ' + str(remaining_pts))

        if daily_points > daily_velocity['sameday']['4']['avg']:
            trend = ':arrow_upper_right: '
        elif daily_points < daily_velocity['sameday']['4']['avg']:
            trend = ':arrow_lower_right:'
        else:
            trend = ':arrow_right:'

        self.slack_msg('Completed ' + day_txt + ': ' + str(daily_points) + ' pts ['
                       + 'Max: ' + str(daily_velocity['sameday']['4']['max'])
                       + ' / '
                       + 'Min: ' + str(daily_velocity['sameday']['4']['min'])
                       + ' / '
                       + 'Avg: ' + str(daily_velocity['sameday']['4']['avg'])
                       + '] '
                       + trend)

        if weekly_points > weekly_velocity['4']['avg']:
            trend = ':arrow_upper_right: '
        elif weekly_points < weekly_velocity['4']['avg']:
            trend = ':arrow_lower_right:'
        else:
            trend = ':arrow_right:'
        self.slack_msg('Completed Week ' + week_txt + ': ' + str(weekly_points) + ' pts ('
                       + 'Max: ' + str(weekly_velocity['4']['max'])
                       + ' / '
                       + 'Min: ' + str(weekly_velocity['4']['min'])
                       + ' / '
                       + 'Avg: ' + str(weekly_velocity['4']['avg'])
                       + ') '
                       + trend)
        self.slack_msg('Days to Completion: ' + str(round(remaining['4'],1)) + ' days')
        self.slack_msg('_Most numbers calculated over previous 4 weeks (excluding current)_')

    def slack_msg(self, msg):
        self.log.info(msg)
        if not self.silent:
            self.slack.notify(text=msg, channel=self.config.get_config_value('slack_channel'))
