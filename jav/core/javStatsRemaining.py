import collections
import os
import copy
from jav.core.javFiles import Files

class StatsRemaining(object):
    """
        The main function of this class is to look at remaining work and guesstimate likely days to completion
    """

    def __init__(self, log, config, time, stats_weeks, remaining_work):
        self.log = log
        self.config = config
        self.time = time
        self.__stats_weeks = stats_weeks
        self.__remaining_work = remaining_work
        self.__remainingstats_filepath = self.config.config_path + 'stats_remaining.jsonl'

    @property
    def remaining_work(self):
        return self.__remaining_work

    def main(self):
        """Guesstimate efforts to completion, add result to a log file"""
        self.log.info('Guesstimating days to completion')
        for scan_week in self.__stats_weeks:
            current_week = self.__stats_weeks[scan_week]
            break

        date_current = self.time.get_current_date()

        remaining = {
            self.config.get_config_value('stats_metric'): self.remaining_work[self.config.get_config_value('stats_metric')]
            , 'datetime': date_current
            , 'types': self.remaining_work['types']
            , 'assignees': self.remaining_work['assignees']
            , 'days_to_completion': {}
        }
        self.log.info('Remaining number of story ' + self.config.get_config_value('stats_metric') + ': ' + str(remaining[self.config.get_config_value('stats_metric')]))
        for week_stat in current_week['stats']:
            avg_elements_per_day = float(current_week['stats'][week_stat]['avg']) / 5
            if avg_elements_per_day > 0:
                remaining_days = round(float(remaining[self.config.get_config_value('stats_metric')]) / float(avg_elements_per_day), 1)
            else:
                remaining_days = 0
            self.log.info('Over period: ' + str(week_stat) + ', average ' + self.config.get_config_value('stats_metric') + ' per day was: ' + str(
                avg_elements_per_day) + ' should completed in: ' + str(remaining_days) + ' days')
            remaining['days_to_completion'][week_stat] = remaining_days

        current_element_per_day = current_week[self.config.get_config_value('stats_metric')] / current_week['days']
        remaining_days = round(remaining[self.config.get_config_value('stats_metric')] / current_element_per_day, 1)
        remaining['days_to_completion']['current'] = remaining_days
        self.log.info('This week, average ' + self.config.get_config_value('stats_metric') + ' per day is: ' + str(
            current_element_per_day) + ' should completed in: ' + str(remaining_days) + ' days')

        # Load previous data and add current day (if already there, replace)
        daily_data = collections.OrderedDict()
        dict_idx = date_current.strftime('%Y-%m-%d')
        daily_data[dict_idx] = remaining

        current_data = Files(self.log).jsonl_load(self.config.filepath_stats_remaining)

        for current_day_data in current_data:
            if date_current.strftime('%Y-%m-%d') != current_data[current_day_data]['datetime'].strftime('%Y-%m-%d'):
                dict_idx = current_data[current_day_data]['datetime'].strftime('%Y-%m-%d')
                daily_data[dict_idx] = current_data[current_day_data]

        if os.path.isfile(self.config.filepath_stats_remaining):
            os.remove(self.config.filepath_stats_remaining)

        for currentdata in daily_data:
            daily_obj = copy.deepcopy(daily_data[currentdata])
            daily_obj['datetime'] = daily_data[currentdata]['datetime'].isoformat()
            self.log.info('StatsRemaining.main(): Writing stats for date: ' + daily_obj['datetime'])
            Files(self.log).jsonl_append(self.config.filepath_stats_remaining, daily_obj)

        return daily_data
