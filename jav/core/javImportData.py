import collections
import json
import os
from datetime import timedelta
from jav.core.javJira import Jira
import dateutil.parser
import copy
import numpy

class importData(object):
    ''' This class is used to obtain data used for processing

    Args:
        log: A class, the logging interface
        appConfig: A class, the app config interface
        config_dir: A string, filesystem location of the configuration directory
    	sourceId: Source ID of the source to capture

    Attributes:
        tbc
    '''

    def __init__(self, log, config):
        self.log = log
        self.config = config
        self.cache_filepath = self.config.getConfig('cache_filepath')
        self.jira = Jira(self.log, self.config)

    def writeJson(self, file, stats):
        with open(file, 'a+') as fileToWrite:
            fileToWrite.write(json.dumps(stats) + '\n')

    def calculateVelocity(self, issues_list):
        velocity = collections.OrderedDict()
        velocity['points'] = 0
        velocity['tickets'] = 0
        for issue in issues_list['issues']:
            if issue['fields']['issuetype']['name'] != 'Sub-task':
                try:
                    velocity['points'] = int(velocity['points'] + issue['fields']['customfield_10002'])
                except:
                    self.log.info('WARNING: Ticket missing story points')
                    self.log.info(json.dumps(issue))

            velocity['tickets'] = velocity['tickets'] + 1
        return velocity

    def loadDailyDataCache(self):
        '''
        Load data from the cache into an ordered dict.
        
        :return: An OrderedDict containing daily results 
        '''
        self.log.info('importData.loadDailyDataCache(): Loading to load data from cache file: ' + self.cache_filepath)
        daily_data = collections.OrderedDict()
        if os.path.isfile(self.cache_filepath):
            for line in open(self.cache_filepath).readlines():
                currentStatsLine = json.loads(line)
                currentStatsLine['datetime'] = dateutil.parser.parse(currentStatsLine['datetime'])
                dict_idx = currentStatsLine['datetime'].strftime('%Y%m%d')
                daily_data[dict_idx] = currentStatsLine
        else:
            self.log.info('importData.loadDailyDataCache(): Nothing to load, cache file does not exist')

        self.log.debug(daily_data)
        return daily_data

    def refreshDailyDataCache(self, daily_data_cache, date_start, date_end):
        self.log.info('importData.refreshDailyDataCache(): start')
        daily_data = collections.OrderedDict()

        date_current = date_start
        while (1):
            dailyObj = {}
            date_current = date_current - timedelta(days=1)
            dict_idx = date_current.strftime('%Y%m%d')

            item_found = False
            # We check if the day is already in the file
            for current_day_data in daily_data_cache:
                if date_current.strftime('%Y-%m-%d') == daily_data_cache[current_day_data]['datetime'].strftime('%Y-%m-%d'):
                    dailyObj = copy.deepcopy(daily_data_cache[current_day_data])
                    dailyObj['datetime'] = daily_data_cache[current_day_data]['datetime'].isoformat()
                    self.writeJson(self.cache_filepath, dailyObj)
                    daily_data[dict_idx] = daily_data_cache[current_day_data]
                    self.log.info('importData.refreshDailyDataCache(): ' + date_current.strftime('%Y.W%W-%A') + ': ' + date_current.strftime('%Y-%m-%d') + ' Already in cache')
                    item_found = True

            if item_found == False:
                # Add skip working day
                if date_current.strftime('%A') != 'Sunday' and date_current.strftime('%A') != 'Saturday':
                    self.log.info('importData.refreshDailyDataCache(): ' + date_current.strftime('%Y.W%W-%A') + ': ' + date_current.strftime('%Y-%m-%d') + ' Obtaining daily data')
                    issues_list = self.jira.getCompletedTickets(date_current).json()
                    self.log.info('importData.refreshDailyDataCache(): ' + date_current.strftime('%Y.W%W-%A') + ': ' + date_current.strftime('%Y-%m-%d') + ' Calculating stats')
                    dailyObj = self.calculateVelocity(issues_list)
                    dailyObj['datetime'] = date_current.isoformat()
                    self.writeJson(self.cache_filepath, dailyObj)
                    daily_data[dict_idx] = dailyObj
                    daily_data[dict_idx]['datetime'] = dateutil.parser.parse(daily_data[dict_idx]['datetime'])

            if date_current.strftime('%Y-%m-%d') < date_end.strftime('%Y-%m-%d'):
                self.log.info('importData.refreshDailyDataCache(): All data collected')
                break

        return daily_data

    def getRemainingWork(self, daily_data):
        self.log.info('importData.getRemainingWork(): Obtaining remaining work')
        issues_list = self.jira.getRemainingTickets().json()
        jira_points_field = self.config.getConfig('jira_field_points')
        remaining = {}
        remaining['points'] = 0
        for issue in issues_list['issues']:
            try:
                remaining['points'] = remaining['points'] + issue['fields'][jira_points_field]
            except Exception as ex:
                # KeyError
                template = 'An exception of type {0} occurred. Arguments:\n{1!r}'
                message = template.format(type(ex).__name__, ex.args)
                self.log.info('WARNING: Ticket missing story points')
                self.log.info(message)
                self.log.info(json.dumps(issue))

        points = []
        for data_idx in daily_data:
            points.append(daily_data[data_idx]['points'])

        remaining['average_daily_points'] = round(numpy.mean(points), 1)
        remaining['effort_days'] = round(remaining['points'] / remaining['average_daily_points'], 1)

        return remaining