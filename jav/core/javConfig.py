import yaml
from os.path import expanduser
import os
import json
import jsonschema
import copy


class Config(object):
    """ 
        Class in charge to configuration management        
    """

    def __init__(self, log):
        self.log = log
        self.__config_path = expanduser('~') + '/.jav/'
        self.__config_filename = 'config.yml'
        self.__config_filepath = self.__config_path + self.__config_filename
        self.__config = None
        self.__schema = {
            '$schema': 'http://json-schema.org/draft-04/schema#'
            , 'title': 'configObj'
            , 'description': 'Configuration values '
            , 'type': 'object'
            , 'additionalProperties': False
            , 'properties': {
                'history_weeks': {
                    'type': ['number']
                    , 'description': 'Number of weeks of history to process from current date'
                    , 'default': 12
                }
                , 'cache_filepath': {
                    'type': ['string']
                    , 'description': 'Path of the cache file'
                    , 'default': self.__config_path + 'data.jsonl'
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

        if os.path.isdir(self.__config_path) is False or os.path.isfile(self.__config_filepath) is False:
            self.init_config()
        elif os.path.isfile(self.__config_filepath):
            self.load_config()

    @property
    def schema(self):
        return self.__schema

    @property
    def config(self):
        return self.__config

    @config.setter
    def config(self, config_obj):
        try:
            jsonschema.validate(config_obj, self.schema)
        except Exception as ex:
            # ValidationError
            self.log.error('The requested configuration update is not valid according to the schema')
            template = 'An exception of type {0} occurred. Arguments:\n{1!r}'
            message = template.format(type(ex).__name__, ex.args)
            self.log.error(message)
            exit()

        self.__config = config_obj

    def get_config_value(self, key):
        return self.config[key]

    def set_config_value(self, key, value):
        """Updates a key/value pair in the config, verify it against the schema before updating config"""
        value_init = self.config[key]
        config_tmp = copy.deepcopy(self.config)
        config_tmp[key] = value
        self.config = config_tmp
        self.log.info(
            'Config.set_config_value: Updated config: ' + key + ' from: ' + value_init + ' to: ' + value)
        return self.config[key]

    def load_config(self):
        """Load content of the YML config file"""
        self.log.info('Config.open_config: Opening settings from config file: ' + self.__config_filepath)
        with open(self.__config_filepath, 'r') as ymlfile:
            cfg = yaml.safe_load(ymlfile)
        self.config = cfg
        return self.config

    def write_config(self):
        """Write config into a YML config file"""
        self.log.info('Config.write_config(): Writing config file to: ' + self.__config_filepath)
        self.log.info('Config.write_config(): Content:' + json.dumps(self.config))
        if not os.path.isdir(self.__config_path):
            os.mkdir(self.__config_path)

        config_file = open(self.__config_filepath, 'w')
        yaml.dump(self.__config, config_file, default_flow_style=False)

        return self.config

    # Need to re-write section below, to get defaults from schema, prompt when empty and load into config object

    def get_default_config(self):
        default_config = {
            'history_weeks': 12
            , 'cache_filepath': self.__config_path + 'data.jsonl'
            , 'jira_username': None
            , 'jira_password': None
            , 'jira_host': None
            , 'jira_jql_velocity': None
            , 'jira_jql_remaining': None
            , 'jira_field_points': 'customfield_10002'
            , 'slack_channel': None
            , 'slack_webhook': None
        }
        return default_config

    def init_config(self):
        self.log.info('Config.init_config(): Unable to find config file, initializing')
        self.config = self.get_default_config()
        self.write_config()
