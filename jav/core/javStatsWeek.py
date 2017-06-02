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
            current_week = self.daily_data[current_day]['datetime'].strftime('%Y.%W')
            if current_week not in self.weeks_data:
                self.weeks_data[current_week] = {}
                self.weeks_data[current_week]['values'] = []
                self.weeks_data[current_week]['datetime'] = self.daily_data[current_day]['datetime']
                self.weeks_data[current_week]['week_name'] = current_week
                self.weeks_data[current_week]['weeklypoints_values'] = []

            self.weeks_data[current_week]['values'].append(self.daily_data[current_day]['points'])
            self.weeks_data[current_week]['week_days'] = len(self.weeks_data[current_week]['values'])
            self.weeks_data[current_week]['week_points'] = sum(self.weeks_data[current_week]['values'])

        # Second pass, get min and max since 'beginning of time'
        for current_week in self.weeks_data:
            week_found = False
            for scan_week in self.weeks_data:
                if week_found is True:
                    self.weeks_data[current_week]['weeklypoints_values'].append(self.weeks_data[scan_week]['week_points'])
                    self.weeks_data[current_week]['weeklypoints_overall_avg'] = int(numpy.mean(self.weeks_data[current_week]['weeklypoints_values']))
                    self.weeks_data[current_week]['weeklypoints_overall_max'] = max(self.weeks_data[current_week]['weeklypoints_values'])
                    self.weeks_data[current_week]['weeklypoints_overall_min'] = min(self.weeks_data[current_week]['weeklypoints_values'])
                    if len(self.weeks_data[current_week]['weeklypoints_values']) <= 4:
                        self.weeks_data[current_week]['weeklypoints_4weeks_avg'] = int(numpy.mean(self.weeks_data[current_week]['weeklypoints_values']))
                        self.weeks_data[current_week]['weeklypoints_4weeks_max'] = max(self.weeks_data[current_week]['weeklypoints_values'])
                        self.weeks_data[current_week]['weeklypoints_4weeks_min'] = min(self.weeks_data[current_week]['weeklypoints_values'])
                    if len(self.weeks_data[current_week]['weeklypoints_values']) <= 8:
                        self.weeks_data[current_week]['weeklypoints_8weeks_avg'] = int(numpy.mean(self.weeks_data[current_week]['weeklypoints_values']))
                        self.weeks_data[current_week]['weeklypoints_8weeks_max'] = max(self.weeks_data[current_week]['weeklypoints_values'])
                        self.weeks_data[current_week]['weeklypoints_8weeks_min'] = min(self.weeks_data[current_week]['weeklypoints_values'])

                if scan_week == current_week:
                    week_found = True

        # Then write content to a JSONL file
        if os.path.isfile(self.weekstats_filepath):
            os.remove(self.weekstats_filepath)

        for current_week in self.weeks_data:
            del self.weeks_data[current_week]['values']
            del self.weeks_data[current_week]['weeklypoints_values']
            week_obj = copy.deepcopy(self.weeks_data[current_week])
            week_obj['datetime'] = self.weeks_data[current_week]['datetime'].isoformat()
            with open(self.weekstats_filepath, 'a+') as fileToWrite:
                fileToWrite.write(json.dumps(week_obj) + '\n')
