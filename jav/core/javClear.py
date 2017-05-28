from jav.core.javConfig import Config
import os

class Clear(object):
    """
        Classe used to clear previously processed data
    """

    def __init__(self, log, app_config):
        self.log = log
        self.config = Config(self.log)

        # This section is used to set-up log files
        self.app_config = app_config
        self.app_config.set(self.log._meta.config_section, 'file', self.config.config_path + 'clear.log')
        self.app_config.set(self.log._meta.config_section, 'rotate', True)
        self.app_config.set(self.log._meta.config_section, 'max_bytes', 512000)
        self.app_config.set(self.log._meta.config_section, 'max_files', 10)
        self.log._setup_file_log()

    def main(self):
        self.log.info('Clearing previously downloaded/processed data')
        if os.path.isfile(self.config.get_config_value('cache_filepath')):
            os.remove(self.config.get_config_value('cache_filepath'))
            self.log.info(self.config.get_config_value('cache_filepath') + ' Removed')

