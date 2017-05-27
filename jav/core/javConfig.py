import yaml
from os.path import expanduser
import os
import json
import jsonschema


class Config(object):
    ''' 
        Class in charge to configuration management
    '''

    def __init__(self, log):
        self.log = log
        self.configPath = expanduser('~') + '/.jav/'
        self.configFilename = 'config.yml'
        self.configFilepath = self.configPath + self.configFilename
        self.currentConfig = None

        if os.path.isdir(self.configPath) is False or os.path.isfile(self.configFilepath) is False:
            self.initConfig()
        elif os.path.isfile(self.configFilepath):
            self.currentConfig = self.importConfig()

        self.schema = {
            '$schema': 'http://json-schema.org/draft-04/schema#'
            , 'title': 'configObj'
            , 'description': 'Configuration values '
            , 'type': 'object'
            , 'additionalProperties': True
            , 'properties': {
                'history_weeks': {
                    'type': ['number']
                    , 'description': 'Number of weeks of history to process from current date'
                    , 'default': 12
                }
                , 'cache_filepath': {
                    'type': ['string']
                    , 'description': 'Path of the cache file'
                    , 'default': self.configPath + 'data.jsonl'
                }
                , 'jira_username': {
                    'type': ['string', 'null']
                    , 'description': 'JIRA Username used for the API call'
                }
                , 'jira_password': {
                    'type': ['string', 'null']
                    , 'description': 'JIRA Password used for the API call'
                }
                , 'jira_host': {
                    'type': ['string', 'null']
                    , 'description': 'Remote JIRA Hostname (https://jira.yourdomain.tld)'
                }
                , 'jira_jql_velocity': {
                    'type': ['string', 'null']
                    , 'description': 'JIRA JQL Query used to track story points completion '
                                     '(for example: project = WORK and status changed to Done)'
                }
                , 'jira_jql_remaining': {
                    'type': ['string', 'null']
                    , 'description': 'JIRA JQL Query used to determine remaining work '
                                     '(for example: sprint in openSprints() and type in (Story, Task, Defect))'
                }
                , 'jira_field_points': {
                    'type': ['string', 'null']
                    , 'description': 'Field used by JIRA to store Story Points'
                    , 'default': 'customfield_10002'
                }
                , 'slack_channel': {
                    'type': ['string', 'null']
                    , 'description': 'Slack channel to post this message to'
                    , 'default': '#general'
                }
                , 'slack_webhook': {
                    'type': ['string', 'null']
                    , 'description': 'Slack webhook (https://api.slack.com/incoming-webhooks)'
                }
            }
        }

    def getSchema(self):
        return self.schema

    def setConfig(self, key, value):
        self.currentConfig[key] = value
        jsonschema.validate(self.currentConfig, self.schema)

    def getDefaultConfig(self):
        defaultConfig = {
            'history_weeks': 12
            , 'cache_filepath': self.configPath + 'data.jsonl'
            , 'jira_username': None
            , 'jira_password': None
            , 'jira_host': None
            , 'jira_jql_velocity': None
            , 'jira_jql_remaining': None
            , 'jira_field_points': 'customfield_10002'
            , 'slack_channel': None
            , 'slack_webhook': None
        }

        return defaultConfig

    def initConfig(self):
        self.log.info('Config.initConfig(): Unable to find config file, initializing')
        self.currentConfig = self.writeConfig(self.getDefaultConfig())

    def writeConfig(self, config):
        self.log.info('Config.writeConfig(): Writing config file')
        self.log.info('Config Object: ' + json.dumps(config))
        if not os.path.isdir(self.configPath):
            os.mkdir(self.configPath)

        configFile = open(self.configFilepath, 'w')
        yaml.dump(config, configFile, default_flow_style=False)

        return config

    def getConfig(self, key):
        if self.currentConfig is None:
            self.currentConfig = self.importConfig()

        jsonschema.validate(self.currentConfig, self.schema)

        if key not in self.currentConfig:
            self.log.error('Config.getConfig(): Key not found in config file: ' + key)
            exit()

        else:
            return self.currentConfig[key]

    def importConfig(self):
        self.log.info('Config.getConfig(): Importing settings from config file: ' + self.configFilepath)
        with open(self.configFilepath, 'r') as ymlfile:
            cfg = yaml.safe_load(ymlfile)

        return cfg
