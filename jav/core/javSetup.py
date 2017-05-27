from jav.core.javConfig import Config

class Setup(object):
    """ 
        tbc
    """

    def __init__(self, log):
        self.log = log
        self.config = Config(self.log)

    def main(self):
        self.log.info('Initiating App Setup')
