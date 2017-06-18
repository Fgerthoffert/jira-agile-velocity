import collections
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
        self.__jira = Jira(self.log, self.config)
        self.__files = Files(self.log)

    @property
    def jira(self):
        return self.__jira

    @jira.setter
    def jira(self, jira_class):
        """This is mostly used for unittest to inject a mock Jira Class"""
        self.__jira = jira_class

    @property
    def files(self):
        return self.__files

    @files.setter
    def files(self, files_class):
        """This is mostly used for unittest to inject a mock Jira Class"""
        self.__files = files_class

    def write_dailydata_cache(self, daily_data):
        """Write an ordered dict into a JSONL file, converting datetime to isoformat"""
        self.log.info('ImportData.write_dailydata_cache(): Write back daily data cache to file: ' + self.config.filepath_data_completion)

        if os.path.isfile(self.config.filepath_data_completion):
            os.remove(self.config.filepath_data_completion)

        for currentdata in daily_data:
            daily_obj = copy.deepcopy(daily_data[currentdata])
            daily_obj['datetime'] = daily_data[currentdata]['datetime'].isoformat()
            self.files.jsonl_append(self.config.filepath_data_completion, daily_obj)

    def refresh_dailydata_cache(self, previous_data_cache, date_start, date_end):
        """
        Starting from date_start, loop through each day until date_end
        For each day, check if the day is already in previous_data cache:
         - If yes, skip the day
         - If not, get from Jira, completed tickets for that day
        """
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
                    daily_data[dict_idx]['datetime'] = dateutil.parser.parse(daily_data[dict_idx]['datetime']).date()

            if date_current.strftime('%Y-%m-%d') < date_end.strftime('%Y-%m-%d'):
                self.log.info('ImportData.refresh_dailydata_cache(): All data collected')
                break
        return daily_data

    def get_story_points(self, issue):
        """Return the number of story points of a particular JIRA issue"""
        jira_points_field = self.config.get_config_value('jira_field_points')
        story_points = None
        try:
            story_points = int(issue['fields'][jira_points_field])
        except Exception:
            self.log.debug('Ticket missing story points')
            self.log.debug(issue)
        return story_points

    def story_types_count(self, issues_list):
        """Return a break down of story points and count per ticket type"""
        self.log.debug('ImportData.story_types_count(): Counting story points per ticket type')
        issues_types = {}
        for issue in issues_list:
            type_name = issue['fields']['issuetype']['name']
            if type_name not in issues_types:
                issues_types[type_name] = {'type': type_name, 'points': 0, 'tickets': 0}
            issue_points = self.get_story_points(issue)
            if issue_points is not None:
                issues_types[type_name]['points'] = int(issues_types[type_name]['points'] + issue_points)
            issues_types[type_name]['tickets'] = int(issues_types[type_name]['tickets'] + 1)
        return issues_types

    def assignee_count(self, issues_list):
        """Return a breakdown of story points and count per assignee """
        self.log.debug('ImportData.assignee_count(): Counting story points per assignees')
        assignees = {}
        for issue in issues_list:
            if issue['fields']['assignee'] is None:
                name = 'unassigned'
                name_display = 'Unassigned'
            else:
                name = issue['fields']['assignee']['name']
                name_display = issue['fields']['assignee']['displayName']
            if name not in assignees:
                assignees[name] = {'displayName': name_display, 'points': 0, 'tickets': 0}
            issue_points = self.get_story_points(issue)
            if issue_points is not None:
                assignees[name]['points'] = int(assignees[name]['points'] + issue_points)
            assignees[name]['tickets'] = int(assignees[name]['tickets'] + 1)
        return assignees

    def count_story_points(self, issues_list):
        """Count the total number of story points in a list of tickets"""
        self.log.debug('ImportData.count_story_points(): Counting total story points in a list of tickets')
        points = 0
        for issue in issues_list:
            issue_points = self.get_story_points(issue)
            if issue_points is not None:
                points = points + issue_points
        return int(points)

    def get_remaining_work(self):
        """Get remaining work from Jira and write the result to file"""
        self.log.info('ImportData.get_remaining_work(): Obtaining remaining work')
        issues_list = self.jira.get_remaining_tickets()

        remaining = {
            'points': self.count_story_points(issues_list['issues'])
            , 'tickets': len(issues_list['issues'])
            , 'types': self.story_types_count(issues_list['issues'])
            , 'assignees': self.assignee_count(issues_list['issues'])
        }
        self.files.json_write(self.config.filepath_data_remaining, remaining)
        return remaining
