from datetime import tzinfo, timedelta, datetime
import dateutil.parser

from jav.core.javConfig import Config
from jav.core.javImportData import importData
from jav.core.javTime import Time
from jav.core.javCrunch import Crunch


class Run(object):
    """ 
        tbc
    """

    def __init__(self, log):
        self.log = log
        self.config = Config(self.log)
        self.time = Time(self.log, self.config)
        self.crunch = Crunch(self.log, self.config, self.time)

    def main(self):
        date_start = self.time.getCurrentDate()
        date_end = self.time.getEndDate()
        self.log.info('run.main(): Start Date: ' + date_start.strftime('%Y-%m-%d'))
        self.log.info('run.main(): End Date: ' + date_end.strftime('%Y-%m-%d'))

        loader = importData(self.log, self.config)
        # Import existing data (if any) into a Python object
        previous_data = loader.loadDailyDataCache()
        # Refresh the cache by checking if additional days can be added
        daily_data = loader.refreshDailyDataCache(previous_data, date_start, date_end)

        current_week_data = self.crunch.getCurrentWeek(daily_data)
        days_data = self.crunch.getDailyAverageWeek(daily_data)



        # Collect data from Jira, calculate number of story points and tickets per day
        # Record those in a JSONL file.
        #daily_data = buildDailyData(date_start, date_end)