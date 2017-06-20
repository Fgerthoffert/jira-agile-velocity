from jav.core.javConfig import Config
from jav.core.javLogConfig import LogConfig


class Setup(object):
    """
        Used to setup the script (fill configuration settings)
    """

    def __init__(self, log, app_config):
        self.log = log
        self.config = Config(self.log)
        self.log_config = LogConfig(self.log, app_config, self.config.config_path + 'setup.log')

    def main(self):
        self.log.info('Initiating App Setup')

        # If conf init was called when Config class was initialized, then we don't call it again
        # This would happen if setup is called before a config file was created
        if self.config.config_init is False:
            self.config.init_config()
