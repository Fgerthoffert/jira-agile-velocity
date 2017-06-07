import collections
import numpy
import json
import os
import copy


class StatsWeek(object):
    """
        The main function of this class goes through all the data points and break it down by week
        It then calculate various metrics for this particular week
        It also look in history to extract trend and evolution over time (such as evolution of the weekly story points average over time)
    """

    def __init__(self, log, config, daily_data):
        self.log = log
        self.config = config
        self.__daily_data = daily_data
        self.__weeks_data = collections.OrderedDict()
        self.__weekstats_filepath = self.config.config_path + 'stats_weeks.jsonl'

    @property
    def daily_data(self):
        return self.__daily_data

    @property
    def weeks_data(self):
        return self.__weeks_data

    @property
    def weekstats_filepath(self):
        return self.__weekstats_filepath

    def main(self):
        self.log.info('Calculate weekly stats throughout the captured period')

        # First pass, calculate weekly values
        for current_day in self.daily_data:
            week_txt = self.daily_data[current_day]['datetime'].strftime('%Y.%W')
            if week_txt not in self.weeks_data:
                self.weeks_data[week_txt] = {
                    'values': []
                    , 'datetime': self.daily_data[current_day]['datetime']
                    , 'weektxt': week_txt
                    , 'stats': {}
                }
            self.weeks_data[week_txt]['values'].append(self.daily_data[current_day]['points'])
            self.weeks_data[week_txt]['days'] = len(self.weeks_data[week_txt]['values'])
            self.weeks_data[week_txt]['points'] = sum(self.weeks_data[week_txt]['values'])

        # Second pass, get min and max since 'beginning of time'
        for week_txt in self.weeks_data:
            del self.weeks_data[week_txt]['values']
            week_found = False
            for scan_week in self.weeks_data:
                if week_found is True:
                    if 'all' not in self.weeks_data[week_txt]['stats']:
                        self.weeks_data[week_txt]['stats']['all'] = {
                            'values': []
                        }
                    self.weeks_data[week_txt]['stats']['all']['values'].append(self.weeks_data[scan_week]['points'])
                    self.weeks_data[week_txt]['stats']['all']['avg'] = int(
                        numpy.mean(self.weeks_data[week_txt]['stats']['all']['values']))
                    self.weeks_data[week_txt]['stats']['all']['max'] = max(
                        self.weeks_data[week_txt]['stats']['all']['values'])
                    self.weeks_data[week_txt]['stats']['all']['min'] = min(
                        self.weeks_data[week_txt]['stats']['all']['values'])
                    for week_idx in self.config.get_config_value('rolling_stats'):
                        if week_idx == 'all' or len(self.weeks_data[week_txt]['stats']['all']['values']) <= week_idx:
                            if week_idx not in self.weeks_data[week_txt]['stats']:
                                self.weeks_data[week_txt]['stats'][week_idx] = {
                                    'values': []
                                }
                            self.weeks_data[week_txt]['stats'][week_idx]['values'].append(
                                self.weeks_data[scan_week]['points'])
                            self.weeks_data[week_txt]['stats'][week_idx]['avg'] = int(
                                numpy.mean(self.weeks_data[week_txt]['stats'][week_idx]['values']))
                            self.weeks_data[week_txt]['stats'][week_idx]['max'] = max(
                                self.weeks_data[week_txt]['stats'][week_idx]['values'])
                            self.weeks_data[week_txt]['stats'][week_idx]['min'] = min(
                                self.weeks_data[week_txt]['stats'][week_idx]['values'])

                if scan_week == week_txt:
                    week_found = True

        # Then write content to a JSONL file
        if os.path.isfile(self.weekstats_filepath):
            os.remove(self.weekstats_filepath)

        for week_txt in self.weeks_data:
            if 'all' in self.weeks_data[week_txt]['stats']:
                del self.weeks_data[week_txt]['stats']['all']['values']
            for week_idx in self.config.get_config_value('rolling_stats'):
                if week_idx in self.weeks_data[week_txt]['stats']:
                    del self.weeks_data[week_txt]['stats'][week_idx]['values']
            week_obj = copy.deepcopy(self.weeks_data[week_txt])
            week_obj['datetime'] = self.weeks_data[week_txt]['datetime'].isoformat()
            with open(self.weekstats_filepath, 'a+') as fileToWrite:
                fileToWrite.write(json.dumps(week_obj) + '\n')

        return self.weeks_data