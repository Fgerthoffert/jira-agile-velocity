from datetime import tzinfo, timedelta, datetime
import pytz

class Time(object):
    ''' 
        tbc
    '''

    def __init__(self, log, config):
        self.log = log
        self.config = config

    def getCurrentDate(self):
        return datetime.now(pytz.timezone('America/Toronto'))

    """
        Search for the oldest Monday past number of history_weeks
    """
    def getEndDate(self):
        history_weeks = self.config.getConfig('history_weeks')
        self.log.info('Time.getEndDate(): Looking back: ' + str(history_weeks) + ' weeks')

        #history_days = int(history_weeks)*7

        tentative_date = self.getCurrentDate() - timedelta(weeks=history_weeks)
        self.log.info('Time.getEndDate(): Tentative date is: ' + tentative_date.isoformat())
        if tentative_date.strftime('%A') == 'Monday':
            end_date = tentative_date
        else:
            self.log.info('Time.getEndDate(): This date is a: ' + tentative_date.strftime('%A') + ' ... looking for previous Monday')
            while (1):
                tentative_date = tentative_date - timedelta(days=1)
                if tentative_date.strftime('%A') == 'Monday':
                    end_date = tentative_date
                    break

        self.log.info('Time.getEndDate(): End date is: ' + tentative_date.isoformat())

        return end_date
