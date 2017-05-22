import yaml
from os.path import expanduser
import os
import json

class Config(object):
    ''' 
        tbc
    '''

    def __init__(self, log):
        self.log = log
        self.configPath = expanduser('~') + '/.jav/'
        self.configFilename = 'config.yml'
        self.configFilepath = self.configPath + self.configFilename
        self.currentConfig = None

        if os.path.isdir(self.configPath) == False or os.path.isfile(self.configFilepath) == False:
            self.initConfig()

    def initConfig(self):
        self.log.info('Config.initConfig(): Unable to find config file, initializing')
        defaultConfig = {
            'date_end' : '2017-01-01'
        }
        self.currentConfig = self.writeConfig(defaultConfig)

    def writeConfig(self, config):
        self.log.info('Config.initConfig(): Writing config file')
        self.log.info('Config Object: ' + json.dumps(config))
        if os.path.isdir(self.configPath) == False:
            os.mkdir(self.configPath)

        configFile = open(self.configFilepath, 'w')
        yaml.dump(config, configFile, default_flow_style=False)

        return config

    def getConfig(self, key):
        if self.currentConfig == None:
            self.currentConfig = self.importConfig()

        if key not in self.currentConfig:
            self.log.error('Config.getConfig(): Key not found in config file: ' + key)
            exit()

        else:
            return self.currentConfig[key]

    def importConfig(self):
        self.log.info('Config.getConfig(): Importing settings from config')
        with open(self.configFilepath, 'r') as ymlfile:
            cfg = yaml.load(ymlfile)
        return cfg

