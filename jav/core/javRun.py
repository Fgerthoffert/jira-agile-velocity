from jav.core.javConfig import Config
from jav.core.javImportData import importData
from jav.core.javTime import Time
from jav.core.javCrunch import Crunch
from jav.core.javTabulate import Tabulate
from jav.core.javMsg import Msg


class Run(object):
    """ 
        Main class used to run the script
    """

    def __init__(self, log, dry_run):
        self.log = log
        self.dry_run = dry_run
        self.config = Config(self.log)
        self.time = Time(self.log, self.config)
        self.crunch = Crunch(self.log, self.config, self.time)
        self.tabulate = Tabulate(self.log, self.config)
        self.msg = Msg(self.log, self.config, self.dry_run)

    def main(self):
        date_start = self.time.getCurrentDate()
        date_end = self.time.getEndDate()
        self.log.info('run.main(): Start Date: ' + date_start.strftime('%Y-%m-%d'))
        self.log.info('run.main(): End Date: ' + date_end.strftime('%Y-%m-%d'))

        loader = importData(self.log, self.config)
        # Import existing data (if any) into a Python object
        previous_data = loader.load_dailydata_cache()
        # Refresh the cache by checking if additional days can be added
        daily_data = loader.refresh_dailydata_cache(previous_data, date_start, date_end)

        current_week_data = self.crunch.get_current_week(daily_data)
        days_data = self.crunch.get_dailyavg_week(daily_data)
        weeks_data = self.crunch.get_weekly_data(daily_data)
        remaining_work = loader.get_remaining_work(daily_data)

        tabulate_days = self.tabulate.generateDays(current_week_data, days_data, weeks_data)
        tabulate_weeks = self.tabulate.generateWeeks(current_week_data, weeks_data)
        tabulate_remaining = self.tabulate.generateRemaining(remaining_work, current_week_data, weeks_data)
        self.msg.publish(remaining_work, tabulate_remaining, tabulate_days, tabulate_weeks)
