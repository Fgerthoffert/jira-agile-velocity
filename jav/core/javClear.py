import os


class Clear(object):
    """
        Classe used to clear previously processed data
    """

    def __init__(self, log, config):
        self.log = log
        self.__config = config

    @property
    def config(self):
        return self.__config

    @config.setter
    def config(self, config_class):
        self.__config = config_class

    def main(self):
        self.log.info('Clearing previously downloaded/processed data')
        self.log.info(self.config.filepath_data_completion)
        if os.path.isfile(self.config.filepath_data_completion):
            os.remove(self.config.filepath_data_completion)
            self.log.info(self.config.filepath_data_completion + ' Removed')

        return True
