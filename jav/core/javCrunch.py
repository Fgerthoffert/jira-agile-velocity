from jav.core.javFiles import Files
from jav.core.javStatsDay import StatsDay
from jav.core.javStatsRemaining import StatsRemaining
from jav.core.javStatsWeek import StatsWeek
from jav.core.javTime import Time


class Crunch(object):
    """
        Receive data and crunch numbers
    """

    def __init__(self, log, config):
        self.log = log
        self.config = config
        self.time = Time(self.log, self.config)

    def crunch_stats(self, daily_data, remaining_work):
        self.log.info('Crunching statistics')

        # Calculate stats based on Jira Data
        stats_weeks = StatsWeek(self.log, self.config, daily_data).main()
        stats_days = StatsDay(self.log, self.config, daily_data).main()
        stats_remaining = StatsRemaining(self.log, self.config, self.time, stats_weeks, remaining_work).main()

        return stats_days, stats_weeks, stats_remaining

    def load_stats_cache(self):
        self.log.info('Loading previously calculated stats from cache')
        stats_days = Files(self.log).jsonl_load(self.config.filepath_stats_days)
        stats_weeks = Files(self.log).jsonl_load(self.config.filepath_stats_weeks)
        stats_remaining = Files(self.log).jsonl_load(self.config.filepath_stats_remaining)

        return stats_days, stats_weeks, stats_remaining
