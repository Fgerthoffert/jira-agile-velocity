import collections
import json
import os
from datetime import timedelta
from jav.core.javJira import Jira
import dateutil.parser
import copy
import numpy


class ImportData(object):
    """ This class is used to obtain data used for processing

    Args:
        log: A class, the logging interface
        config: A class, the app config interface

    Attributes:
        tbc
    """

    def __init__(self, log, config):
        self.log = log
        self.config = config
        self.jira = Jira(self.log, self.config)

        self.__cache_filepath = self.config.get_config_value('cache_filepath')

    @property
    def cache_filepath(self):
        return self.__cache_filepath

    def write_json(self, stats):
        with open(self.cache_filepath, 'a+') as fileToWrite:
            fileToWrite.write(json.dumps(stats) + '\n')

    def calculate_velocity(self, issues_list):
        velocity = collections.OrderedDict()
        velocity['points'] = self.count_story_points(issues_list['issues'])
        velocity['tickets'] = len(issues_list['issues'])
        return velocity

    def write_dailydata_cache(self, daily_data):
        """Write an ordered dict into a JSONL file"""
        self.log.info('ImportData.write_dailydata_cache(): Write back daily data cache to file: ' + self.cache_filepath)

        if os.path.isfile(self.cache_filepath):
            os.remove(self.cache_filepath)

        for currentdata in daily_data:
            daily_obj = copy.deepcopy(daily_data[currentdata])
            daily_obj['datetime'] = daily_data[currentdata]['datetime'].isoformat()
            self.write_json(daily_obj)

    def load_dailydata_cache(self):
        """
        Load data from the cache into an ordered dict.

        :return: An OrderedDict containing daily results
        """
        self.log.info('ImportData.load_dailydata_cache(): Loading to load data from cache file: ' + self.cache_filepath)
        daily_data = collections.OrderedDict()
        if os.path.isfile(self.cache_filepath):
            for line in open(self.cache_filepath).readlines():
                current_stats_line = json.loads(line)
                current_stats_line['datetime'] = dateutil.parser.parse(current_stats_line['datetime'])
                dict_idx = current_stats_line['datetime'].strftime('%Y%m%d')
                daily_data[dict_idx] = current_stats_line
        else:
            self.log.info('ImportData.load_dailydata_cache(): Nothing to load, cache file does not exist')

        self.log.debug(daily_data)
        return daily_data

    def refresh_dailydata_cache(self, previous_data_cache, date_start, date_end):
        self.log.info('ImportData.refresh_dailydata_cache(): start')
        daily_data = collections.OrderedDict()

        date_current = date_start
        while 1:
            date_current = date_current - timedelta(days=1)
            dict_idx = date_current.strftime('%Y%m%d')

            item_found = False
            # We check if the day is already in the file
            for current_day_data in previous_data_cache:
                if date_current.strftime('%Y-%m-%d') == previous_data_cache[current_day_data]['datetime'].strftime('%Y-%m-%d'):
                    daily_obj = copy.deepcopy(previous_data_cache[current_day_data])
                    daily_obj['datetime'] = previous_data_cache[current_day_data]['datetime'].isoformat()
                    #self.write_json(self.cache_filepath, daily_obj)
                    daily_data[dict_idx] = previous_data_cache[current_day_data]
                    self.log.info('ImportData.refresh_dailydata_cache(): ' + date_current.strftime('%Y.W%W-%A') + ': ' + date_current.strftime('%Y-%m-%d') + ' Already in cache')
                    item_found = True

            if not item_found:
                if date_current.strftime('%A') != 'Sunday' and date_current.strftime('%A') != 'Saturday':
                    self.log.info('ImportData.refresh_dailydata_cache(): ' + date_current.strftime(
                        '%Y.W%W-%A') + ': ' + date_current.strftime('%Y-%m-%d') + ' Obtaining daily data')
                    issues_list = self.jira.get_completed_tickets(date_current).json()
                    self.log.info('ImportData.refresh_dailydata_cache(): ' + date_current.strftime(
                        '%Y.W%W-%A') + ': ' + date_current.strftime('%Y-%m-%d') + ' Calculating stats')
                    daily_obj = self.calculate_velocity(issues_list)
                    daily_obj['datetime'] = date_current.isoformat()
                    #self.write_json(self.cache_filepath, daily_obj)
                    daily_data[dict_idx] = daily_obj
                    daily_data[dict_idx]['datetime'] = dateutil.parser.parse(daily_data[dict_idx]['datetime'])

            if date_current.strftime('%Y-%m-%d') < date_end.strftime('%Y-%m-%d'):
                self.log.info('ImportData.refresh_dailydata_cache(): All data collected')
                break

        return daily_data

    def count_story_points(self, issues_list):
        self.log.info('ImportData.count_story_points(): Counting total story points in a list of tickets')
        jira_points_field = self.config.get_config_value('jira_field_points')
        points = 0
        for issue in issues_list:
            try:
                points = points + issue['fields'][jira_points_field]
            except Exception as ex:
                # KeyError
                template = 'An exception of type {0} occurred. Arguments:\n{1!r}'
                message = template.format(type(ex).__name__, ex.args)
                self.log.info('WARNING: Ticket missing story points')
                self.log.info(message)
                self.log.info(json.dumps(issue))
        return int(points)


    def get_remaining_work(self, daily_data):
        self.log.info('ImportData.get_remaining_work(): Obtaining remaining work')
        issues_list = self.jira.get_remaining_tickets().json()
        remaining = {'points': 0}
        remaining['points'] = self.count_story_points(issues_list['issues'])
        points = []
        for data_idx in daily_data:
            points.append(daily_data[data_idx]['points'])

        remaining['average_daily_points'] = round(numpy.mean(points), 1)
        remaining['effort_days'] = round(remaining['points'] / remaining['average_daily_points'], 1)

        return remaining
