from jav.core.javConfig import Config
from jav.core.javLogConfig import LogConfig
from jav.core.javBuildChart import BuildChart
import collections
import json
import dateutil.parser

import os


class Chart(object):
    """
        Class used to clear previously processed data
    """

    def __init__(self, log, app_config):
        self.log = log
        self.config = Config(self.log)
        self.log_config = LogConfig(self.log, app_config, self.config.config_path + 'chart.log')
        self.__daystats_filepath = self.config.config_path + 'stats_days.jsonl'
        self.__weekstats_filepath = self.config.config_path + 'stats_weeks.jsonl'
        self.__remainingstats_filepath = self.config.config_path + 'stats_remaining.jsonl'

    @property
    def daystats_filepath(self):
        return self.__daystats_filepath

    @property
    def weekstats_filepath(self):
        return self.__weekstats_filepath

    @property
    def remainingstats_filepath(self):
        return self.__remainingstats_filepath

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

    def main(self):
        self.log.info('Building charts from cache data')

        stats_days = self.load_stats_file(self.daystats_filepath)
        stats_weeks = self.load_stats_file(self.weekstats_filepath)
        stats_remaining = self.load_stats_file(self.remainingstats_filepath)

        build_graph = BuildChart(self.log, self.config).main(stats_days, stats_weeks, stats_remaining)
