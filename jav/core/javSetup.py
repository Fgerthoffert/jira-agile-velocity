from jav.core.javConfig import Config

class Setup(object):
    ''' 
        Classed used to setup the script (fill various settings)
    '''

    def __init__(self, log):
        self.log = log
        self.config = Config(self.log)

    def main(self):
        self.log.info('Initiating App Setup')
        self.log.info('Press Enter for default, CTRL+C to exit')
        configSchema = self.config.schema['properties']
        for config_param in configSchema:
            if 'default' in configSchema[config_param]:
                self.log.info(configSchema[config_param]['description'] + ' (DEFAULT: ' + str(
                    configSchema[config_param]['default']) + ')')
            else:
                self.log.info(configSchema[config_param]['description'])
            config_value = input('[' + config_param + ']:')
            if 'default' in configSchema[config_param] and config_value == '':
                config_value = configSchema[config_param]['default']

            self.config.set_config_value(config_param, config_value)
            print (config_value)