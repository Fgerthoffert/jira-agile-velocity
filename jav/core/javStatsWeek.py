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
                self.weeks_data[current_week]['history_perweek_values'] = []
                self.weeks_data[current_week]['history_perday_values'] = []

            self.weeks_data[current_week]['values'].append(self.daily_data[current_day]['points'])
            self.weeks_data[current_week]['avg'] = int(numpy.mean(self.weeks_data[current_week]['values']))
            self.weeks_data[current_week]['days'] = len(self.weeks_data[current_week]['values'])
            self.weeks_data[current_week]['sum'] = sum(self.weeks_data[current_week]['values'])

        # Second pass, get min and max since 'beginning of time'
        for current_week in self.weeks_data:
            week_found = False
            for scan_week in self.weeks_data:
                if week_found is True:
                    self.weeks_data[current_week]['history_perweek_values'].append(self.weeks_data[scan_week]['sum'])
                    self.weeks_data[current_week]['history_perweek_avg'] = int(
                        numpy.mean(self.weeks_data[current_week]['history_perweek_values']))
                    self.weeks_data[current_week]['history_perweek_min'] = min(
                        self.weeks_data[current_week]['history_perweek_values'])
                    self.weeks_data[current_week]['history_perweek_max'] = max(
                        self.weeks_data[current_week]['history_perweek_values'])

                    self.weeks_data[current_week]['history_perday_values'].append(self.weeks_data[scan_week]['avg'])
                    self.weeks_data[current_week]['history_perday_avg'] = int(
                        numpy.mean(self.weeks_data[current_week]['history_perday_values']))
                    self.weeks_data[current_week]['history_perday_min'] = min(
                        self.weeks_data[current_week]['history_perday_values'])
                    self.weeks_data[current_week]['history_perday_max'] = max(
                        self.weeks_data[current_week]['history_perday_values'])

                if scan_week == current_week:
                    week_found = True

        # Then write content to a JSONL file
        if os.path.isfile(self.weekstats_filepath):
            os.remove(self.weekstats_filepath)

        for current_week in self.weeks_data:
            week_obj = copy.deepcopy(self.weeks_data[current_week])
            week_obj['datetime'] = self.weeks_data[current_week]['datetime'].isoformat()
            with open(self.weekstats_filepath, 'a+') as fileToWrite:
                fileToWrite.write(json.dumps(week_obj) + '\n')
