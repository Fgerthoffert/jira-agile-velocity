from datetime import datetime
import pytz


class Time(object):
    """
        Class in charge or handling various time-related functions
    """

    def __init__(self, log, config):
        self.log = log
        self.config = config

    @staticmethod
    def get_current_date():
        return datetime.now(pytz.timezone('America/Toronto'))

    def get_end_date(self):
        """Get end_date as a datetime object from configuration"""
        return datetime.strptime(self.config.get_config_value('end_date'), "%Y-%m-%d").date()

