from jav.core.javConfig import Config
from jav.core.javLogConfig import LogConfig
import os


class Clear(object):
    """
        Classe used to clear previously processed data
    """

    def __init__(self, log, app_config):
        self.log = log
        self.config = Config(self.log)
        self.log_config = LogConfig(self.log, app_config, self.config.config_path + 'clear.log')

    def main(self):
        self.log.info('Clearing previously downloaded/processed data')
        if os.path.isfile(self.config.filepath_data_completion):
            os.remove(self.config.filepath_data_completion)
            self.log.info(self.config.filepath_data_completion + ' Removed')

        return True
