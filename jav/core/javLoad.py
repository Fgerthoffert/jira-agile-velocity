from jav.core.javConfig import Config
from jav.core.javLogConfig import LogConfig
from jav.core.javImportData import ImportData
from jav.core.javTime import Time
from jav.core.javFiles import Files


class Load(object):
    """
        Load updated Jira data into cache
    """
    def __init__(self, log, app_config):
        self.log = log
        self.config = Config(self.log)
        self.time = Time(self.log, self.config)
        self.log_config = LogConfig(self.log, app_config, self.config.config_path + 'load.log')

    def refresh_jira_cache(self):
        self.log.info('Load updated data from Jira into Cache')

        date_start = self.time.get_current_date()
        date_end = self.time.get_end_date()
        self.log.info('Load.main(): Start Date: ' + date_start.strftime('%Y-%m-%d'))
        self.log.info('Load.main(): End Date: ' + date_end.strftime('%Y-%m-%d'))

        loader = ImportData(self.log, self.config)
        # Import existing data (if any) into a Python object
        previous_data = Files(self.log).jsonl_load(self.config.filepath_data_completion)
        # Refresh the cache by checking if additional days can be added
        daily_data = loader.refresh_dailydata_cache(previous_data, date_start, date_end)
        # Write back the data cache to file after clearing any existing one
        loader.write_dailydata_cache(daily_data)

        # Call Jira to get Remaining work
        remaining_work = loader.get_remaining_work()

        return daily_data, remaining_work

    def load_jira_cache(self):
        self.log.info('Load daily data and remaining work from cache')
        # Import existing data (if any) into a Python object
        daily_data = Files(self.log).jsonl_load(self.config.filepath_data_completion)
        remaining_work = Files(self.log).json_load(self.config.filepath_data_remaining)
        if remaining_work is None or daily_data is None:
            self.log.error('Unable to load cached data, please run \'jav load\' first')
            exit()

        return daily_data, remaining_work

