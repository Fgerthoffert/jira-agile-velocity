import collections
import json
import os
from datetime import timedelta
from jav.core.javJira import Jira
import dateutil.parser
import copy
from jav.core.javFiles import Files

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

    def calculate_velocity(self, issues_list):
        velocity = collections.OrderedDict()
        velocity['points'] = self.count_story_points(issues_list['issues'])
        velocity['tickets'] = len(issues_list['issues'])
        return velocity

    def write_dailydata_cache(self, daily_data):
        """Write an ordered dict into a JSONL file"""
        self.log.info('ImportData.write_dailydata_cache(): Write back daily data cache to file: ' + self.config.filepath_data_completion)

        if os.path.isfile(self.config.filepath_data_completion):
            os.remove(self.config.filepath_data_completion)

        for currentdata in daily_data:
            daily_obj = copy.deepcopy(daily_data[currentdata])
            daily_obj['datetime'] = daily_data[currentdata]['datetime'].isoformat()
            Files(self.log).jsonl_append(self.config.filepath_data_completion, daily_obj)

    def load_data_remaining(self):
        """
        Load data from the cache into an object.

        :return: An Object containing daily results
        """
        self.log.info('ImportData.load_data_remaining(): Loading data from cache file: ' + self.config.filepath_data_remaining)
        data_remaining = Files(self.log).json_load(self.config.filepath_data_remaining)
        if data_remaining is None:
            self.log.info('ImportData.load_data_remaining(): Nothing to load, cache file does not exist')
        self.log.debug(data_remaining)
        return data_remaining

    def load_data_completion(self):
        """
        Load data from the cache into an ordered dict.

        :return: An OrderedDict containing daily results
        """
        self.log.info('ImportData.load_data_completion(): Loading data from cache file: ' + self.config.filepath_data_completion)
        daily_data = Files(self.log).jsonl_load(self.config.filepath_data_completion)

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
                if date_current.strftime('%Y-%m-%d') == previous_data_cache[current_day_data]['datetime'].strftime(
                        '%Y-%m-%d'):
                    daily_obj = copy.deepcopy(previous_data_cache[current_day_data])
                    daily_obj['datetime'] = previous_data_cache[current_day_data]['datetime'].isoformat()
                    daily_data[dict_idx] = previous_data_cache[current_day_data]
                    self.log.info('ImportData.refresh_dailydata_cache(): ' + date_current.strftime(
                        '%Y.W%W-%A') + ': ' + date_current.strftime('%Y-%m-%d') + ' Already in cache')
                    item_found = True

            if not item_found:
                if date_current.strftime('%A') != 'Sunday' and date_current.strftime('%A') != 'Saturday':
                    self.log.info('ImportData.refresh_dailydata_cache(): ' + date_current.strftime(
                        '%Y.W%W-%A') + ': ' + date_current.strftime('%Y-%m-%d') + ' Obtaining daily data')
                    issues_list = self.jira.get_completed_tickets(date_current)
                    self.log.info('ImportData.refresh_dailydata_cache(): ' + date_current.strftime(
                        '%Y.W%W-%A') + ': ' + date_current.strftime('%Y-%m-%d') + ' Calculating stats')
                    daily_obj = {
                        'points': self.count_story_points(issues_list['issues'])
                        , 'tickets': len(issues_list['issues'])
                        , 'datetime': date_current.isoformat()
                        , 'types': self.story_types_count(issues_list['issues'])
                        , 'assignees': self.assignee_count(issues_list['issues'])
                    }
                    daily_data[dict_idx] = daily_obj
                    daily_data[dict_idx]['datetime'] = dateutil.parser.parse(daily_data[dict_idx]['datetime'])

            if date_current.strftime('%Y-%m-%d') < date_end.strftime('%Y-%m-%d'):
                self.log.info('ImportData.refresh_dailydata_cache(): All data collected')
                break

        return daily_data

    def get_story_point(self, issue):
        jira_points_field = self.config.get_config_value('jira_field_points')
        points = 0
        try:
            points = points + issue['fields'][jira_points_field]
        except Exception as ex:
            # KeyError
            template = 'An exception of type {0} occurred. Arguments:\n{1!r}'
            message = template.format(type(ex).__name__, ex.args)
            self.log.info('WARNING: Ticket missing story points')
            self.log.info(message)
            self.log.info(json.dumps(issue))
        return points

    def story_types_count(self, issues_list):
        self.log.info('ImportData.story_types_count(): Counting story points per ticket type')
        issues_types = {}
        for issue in issues_list:
            type_name = issue['fields']['issuetype']['name']
            if type_name not in issues_types:
                issues_types[type_name] = {'type': type_name, 'points': 0, 'tickets': 0}
            issues_types[type_name]['points'] = int(issues_types[type_name]['points'] + self.get_story_point(issue))
            issues_types[type_name]['tickets'] = int(issues_types[type_name]['tickets'] + 1)
        return issues_types

    def assignee_count(self, issues_list):
        self.log.info('ImportData.assignee_count(): Counting story points per assignees')
        assignees = {}
        for issue in issues_list:
            name = issue['fields']['assignee']['name']
            if name not in assignees:
                assignees[name] = {'displayName': issue['fields']['assignee']['displayName'], 'points': 0, 'tickets': 0}
            assignees[name]['points'] = int(assignees[name]['points'] + self.get_story_point(issue))
            assignees[name]['tickets'] = int(assignees[name]['tickets'] + 1)
        return assignees

    def count_story_points(self, issues_list):
        self.log.info('ImportData.count_story_points(): Counting total story points in a list of tickets')
        points = 0
        for issue in issues_list:
            points = points + self.get_story_point(issue)
        return int(points)

    def get_remaining_work(self):
        self.log.info('ImportData.get_remaining_work(): Obtaining remaining work')
        issues_list = self.jira.get_remaining_tickets()

        remaining = {
            'points': self.count_story_points(issues_list['issues'])
            , 'tickets': len(issues_list['issues'])
            , 'types': self.story_types_count(issues_list['issues'])
            , 'assignees': self.assignee_count(issues_list['issues'])
        }

        Files(self.log).json_write(self.config.filepath_data_remaining, remaining)

        return remaining
