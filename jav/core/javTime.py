from datetime import timedelta, datetime
import pytz


class Time(object):
    """
        Class in charge or handling various time-related functions
    """

    def __init__(self, log, config):
        self.log = log
        self.config = config

    def get_current_date(self):
        return datetime.now(pytz.timezone('America/Toronto'))

    def get_end_date(self):
        """Search for the oldest Monday past number of history_weeks"""
        history_weeks = self.config.get_config_value('history_weeks')
        self.log.info('Time.get_end_date(): Looking back: ' + str(history_weeks) + ' weeks')

        tentative_date = self.get_current_date() - timedelta(weeks=history_weeks)
        self.log.info('Time.get_end_date(): Tentative date is: ' + tentative_date.isoformat())
        if tentative_date.strftime('%A') == 'Monday':
            end_date = tentative_date
        else:
            self.log.info('Time.get_end_date(): This date is a: ' + tentative_date.strftime(
                '%A') + ' ... looking for previous Monday')
            while 1:
                tentative_date = tentative_date - timedelta(days=1)
                if tentative_date.strftime('%A') == 'Monday':
                    end_date = tentative_date
                    break

        self.log.info('Time.get_end_date(): End date is: ' + tentative_date.isoformat())
        return end_date
