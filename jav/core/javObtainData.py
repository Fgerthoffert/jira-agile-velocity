class obtainData(object):
    """ This class is used to obtain data used for processing

    Args:
        log: A class, the logging interface
        appConfig: A class, the app config interface
        config_dir: A string, filesystem location of the configuration directory
    	sourceId: Source ID of the source to capture

    Attributes:
        tbc
    """

    def __init__(self, log):
        self.log = log

    def main(date_start, date_end):
        date_current = date_start
        daily_data = collections.OrderedDict()
