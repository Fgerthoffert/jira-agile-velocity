import slackweb

class Msg(object):
    """
        Display messages to console or send to slack depending of the user selected mode
    """

    def __init__(self, log, config, send):
        self.log = log
        self.config = config
        self.__send = send
        if self.send:
            self.__slack = slackweb.Slack(url=self.config.get_config_value('slack_webhook'))

    @property
    def send(self):
        return self.__send

    @property
    def slack(self):
        return self.__slack

    def publish(self, stats_days, stats_weeks, stats_remaining):
        remaining = []
        for scan_day in stats_remaining:
            remaining = stats_remaining[scan_day]['days_to_completion']
            remaining_pts = stats_remaining[scan_day][self.config.get_config_value('stats_metric')]
            break
        for scan_day in stats_days:
            daily_velocity = stats_days[scan_day]
            daily_metric = stats_days[scan_day][self.config.get_config_value('stats_metric')]
            day_txt = stats_days[scan_day]['daytxt']
            break
        for scan_week in stats_weeks:
            week_txt = stats_weeks[scan_week]['weektxt']
            weekly_velocity = stats_weeks[scan_week]['stats']
            weekly_metric = stats_weeks[scan_week][self.config.get_config_value('stats_metric')]
            week_estimate = None
            if stats_weeks[scan_week]['days'] < 5:
                days_remaining = 5 - stats_weeks[scan_week]['days']
                points_remaining = days_remaining * stats_weeks[scan_week]['stats']['4']['avg']
                week_estimate = points_remaining + stats_weeks[scan_week]['points']
            break

        if daily_metric > daily_velocity['sameday']['4']['avg']:
            trend_day = ':arrow_upper_right:'
        elif daily_metric < daily_velocity['sameday']['4']['avg']:
            trend_day = ':arrow_lower_right:'
        else:
            trend_day = ':arrow_right:'

        if week_estimate is None:
            if weekly_metric > weekly_velocity['4']['avg']:
                trend_week = ':arrow_upper_right:'
            elif weekly_metric < weekly_velocity['4']['avg']:
                trend_week = ':arrow_lower_right:'
            else:
                trend_week = ':arrow_right:'
        else:
            if week_estimate > weekly_velocity['4']['avg']:
                trend_week = ':arrow_upper_right: (Est: ' + week_estimate + ')'
            elif week_estimate < weekly_velocity['4']['avg']:
                trend_week = ':arrow_lower_right: (Est: ' + week_estimate + ')'
            else:
                trend_week = ':arrow_right: (Est: ' + week_estimate + ')'

        if self.config.get_config_value('stats_metric') == 'tickets':
            metric_legend = 'Tickets'
            metric_short = 'tix'
        else:
            metric_legend = 'Story Points'
            metric_short = 'pts'

        self.slack_msg('Howdy everyone, here are our velocity stats, <'
                       + self.config.get_config_value('git_pageurl')
                       + '|live from Jira>.'
                       + '\n'
                       + 'Remaining ' + metric_legend + ': *'
                       + str(remaining_pts)
                       + '*\n'
                       + 'Completed on ' + day_txt + ': ' + str(daily_metric) + ' ' + metric_short + ' ['
                       + 'Max: ' + str(daily_velocity['sameday']['4']['max'])
                       + ' / '
                       + 'Min: ' + str(daily_velocity['sameday']['4']['min'])
                       + ' / '
                       + 'Avg: ' + str(daily_velocity['sameday']['4']['avg'])
                       + '] '
                       + trend_day
                       + '\n'
                       + 'Completed this week (' + week_txt + '): ' + str(weekly_metric) + ' ' + metric_short + ' ('
                       + 'Max: ' + str(weekly_velocity['4']['max'])
                       + ' / '
                       + 'Min: ' + str(weekly_velocity['4']['min'])
                       + ' / '
                       + 'Avg: ' + str(weekly_velocity['4']['avg'])
                       + ') '
                       + trend_week
                       + '\n'
                       + 'Days to Completion: *'
                       + str(round(remaining['4'], 1))
                       + ' days'
                       + '*\n'
                       + '_Most numbers are calculated over previous 4 weeks, excluding current day/week_'
                       )

    def slack_msg(self, msg):
        self.log.info(msg)
        if self.send:
            self.slack.notify(text=msg, channel=self.config.get_config_value('slack_channel'))
