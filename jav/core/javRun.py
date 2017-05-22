import os, sys
from datetime import tzinfo, timedelta, datetime
import dateutil.parser
import pytz
import json
import yaml
import requests
import collections
import tabulate
import copy
import slackweb

from jav.core.javConfig import Config


class Run(object):
    """ 
        tbc
    """

    def __init__(self, log):
        self.log = log
        self.config = Config(self.log)

    def getCurrentDate(self):
        return datetime.now(pytz.timezone('America/Toronto'))

    def getConfig(self):
        with open('config.yml', 'r') as ymlfile:
            cfg = yaml.load(ymlfile)
        return cfg

    def main(self):
        date_start = self.getCurrentDate()
        date_end = self.config.getConfig('date_end')
        self.log.info('run.main(): Start Date: ' + date_start.strftime('%Y-%m-%d'))
        self.log.info('run.main(): End Date: ' + date_end.strftime('%Y-%m-%d'))

        # Collect data from Jira, calculate number of story points and tickets per day
        # Record those in a JSONL file.
        daily_data = buildDailyData(date_start, date_end)