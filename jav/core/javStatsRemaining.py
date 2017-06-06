import collections
import os
import copy
import json
import dateutil


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
    def daystats_filepath(self):
        return self.__remainingstats_filepath

    @property
    def remaining_work(self):
        return self.__remaining_work

    def load_stat_file(self):
        self.log.info('StatsRemaining.load_stat_file(): Loading stats from file: ' + self.daystats_filepath)
        daily_data = collections.OrderedDict()
        if os.path.isfile(self.daystats_filepath):
            for line in open(self.daystats_filepath).readlines():
                current_stats_line = json.loads(line)
                current_stats_line['datetime'] = dateutil.parser.parse(current_stats_line['datetime'])
                dict_idx = current_stats_line['datetime'].strftime('%Y%m%d')
                self.log.info('StatsRemaining.load_stat_file(): Loaded stats from: ' + current_stats_line['datetime'].isoformat())
                daily_data[dict_idx] = current_stats_line
        else:
            self.log.info('StatsRemaining.load_stat_file(): Nothing to load, cache file does not exist')

        self.log.debug(daily_data)
        return daily_data

    def write_json(self, stats):
        with open(self.daystats_filepath, 'a+') as fileToWrite:
            fileToWrite.write(json.dumps(stats) + '\n')

    def main(self):
        """Guesstimate efforts to completion, add result to a log file"""
        self.log.info('Guesstimating days to completion')
        for scan_week in self.__stats_weeks:
            current_week = self.__stats_weeks[scan_week]
            break

        date_current = self.time.get_current_date()

        print (self.remaining_work)

        remaining = {
            'points': self.remaining_work['points']
            , 'datetime': date_current
            , 'types': self.remaining_work['types']
            , 'assignees': self.remaining_work['assignees']
            , 'days_to_completion': {}
        }
        self.log.info('Remaining number of story points: ' + str(remaining['points']))
        for week_stat in current_week['stats']:
            avg_points_per_day = current_week['stats'][week_stat]['avg'] / 5
            remaining_days = round(remaining['points'] / avg_points_per_day, 1)
            self.log.info('Over period: ' + str(week_stat) + ', average points per day was: ' + str(
                avg_points_per_day) + ' should completed in: ' + str(remaining_days) + ' days')
            remaining['days_to_completion'][week_stat] = remaining_days

        current_points_per_day = current_week['points'] / current_week['days']
        remaining_days = round(remaining['points'] / current_points_per_day, 1)
        remaining['days_to_completion']['current'] = remaining_days
        self.log.info('This week, average points per day is: ' + str(
            current_points_per_day) + ' should completed in: ' + str(remaining_days) + ' days')

        # Load previous data and add current day (if already there, replace)
        daily_data = collections.OrderedDict()
        dict_idx = date_current.strftime('%Y-%m-%d')
        daily_data[dict_idx] = remaining

        current_data = self.load_stat_file()

        for current_day_data in current_data:
            if date_current.strftime('%Y-%m-%d') != current_data[current_day_data]['datetime'].strftime('%Y-%m-%d'):
                dict_idx = current_data[current_day_data]['datetime'].strftime('%Y-%m-%d')
                daily_data[dict_idx] = current_data[current_day_data]

        if os.path.isfile(self.daystats_filepath):
            os.remove(self.daystats_filepath)

        for currentdata in daily_data:
            daily_obj = copy.deepcopy(daily_data[currentdata])
            daily_obj['datetime'] = daily_data[currentdata]['datetime'].isoformat()
            self.log.info('StatsRemaining.main(): Writing stats to: ' + daily_obj['datetime'])
            self.write_json(daily_obj)

        return remaining
