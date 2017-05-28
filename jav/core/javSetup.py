from jav.core.javConfig import Config


class Setup(object):
    """
        Classed used to setup the script (fill configuration settings)
    """

    def __init__(self, log):
        self.log = log
        self.config = Config(self.log)

    def main(self):
        self.log.info('Initiating App Setup')
        self.config.init_config()