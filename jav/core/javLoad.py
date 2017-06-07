import collections
import json
import dateutil.parser

from jav.core.javConfig import Config
from jav.core.javLogConfig import LogConfig
from jav.core.javImportData import ImportData
from jav.core.javTime import Time


class Load(object):
    """
        Load updated Jira data into cache
    """
    def __init__(self, log, app_config):
        self.log = log
        self.config = Config(self.log)
        self.time = Time(self.log, self.config)
        self.log_config = LogConfig(self.log, app_config, self.config.config_path + 'load.log')

    def refresh_jira(self):
        self.log.info('Load updated data from Jira into Cache')

        date_start = self.time.get_current_date()
        date_end = self.time.get_end_date()
        self.log.info('Load.main(): Start Date: ' + date_start.strftime('%Y-%m-%d'))
        self.log.info('Load.main(): End Date: ' + date_end.strftime('%Y-%m-%d'))

        loader = ImportData(self.log, self.config)
        # Import existing data (if any) into a Python object
        previous_data = loader.load_dailydata_cache()
        # Refresh the cache by checking if additional days can be added
        daily_data = loader.refresh_dailydata_cache(previous_data, date_start, date_end)
        # Write back the data cache to file after clearing any existing one
        loader.write_dailydata_cache(daily_data)

        # Call Jira to get Remaining work
        remaining_work = loader.get_remaining_work()

        return daily_data, remaining_work

    def load_stats_file(self, filepath):
        stats_days = collections.OrderedDict()

        for line in open(filepath).readlines():
            try:
                currentCaptureLine = json.loads(line)
                currentCaptureLine['datetime'] = dateutil.parser.parse(currentCaptureLine['datetime'])
                dict_idx = currentCaptureLine['datetime'].strftime('%Y%m%d')
                stats_days[dict_idx] = currentCaptureLine
                self.log.info('Loaded from: ' + filepath + ' stats for: ' + currentCaptureLine['datetime'].strftime('%Y-%m-%d'))
            except Exception as ex:
                # KeyError
                template = 'An exception of type {0} occurred. Arguments:\n{1!r}'
                message = template.format(type(ex).__name__, ex.args)
                self.log.info('WARNING: Unable to decode json line:' + line)
                self.log.info(message)

        return stats_days
