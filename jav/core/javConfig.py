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
        self.__config_filename_cache_completion = 'data_completion.jsonl'
        self.__filename_cache_completion = 'data_completion.jsonl'
        self.__filename_cache_remaining = 'data_remaining.json'
        self.__filename_stats_days = 'data_remaining.json'
        self.__filename_stats_weeks = 'data_remaining.json'
        self.__filename_stats_remaining = 'data_remaining.json'

        self.__config = {}
        self.__schema = {
            '$schema': 'http://json-schema.org/draft-04/schema#'
            , 'title': 'configObj'
            , 'description': 'Configuration values '
            , 'type': 'object'
            , 'additionalProperties': False
            , 'properties': {
                'history_weeks': {
                    'type': ['number']
                    , 'description': 'Number of weeks of history, from current date to collect data from'
                    , 'default': 12
                }
                , 'end_date': {
                    'type': ['string']
                    , 'description': 'Earliest date to collect data from'
                    , 'default': '2017-01-01'
                }
                , 'jira_username': {
                    'type': ['string']
                    , 'description': 'JIRA Username used for the API call'
                }
                , 'jira_password': {
                    'type': ['string']
                    , 'description': 'JIRA Password used for the API call'
                }
                , 'jira_host': {
                    'type': ['string']
                    , 'description': 'Remote JIRA Hostname (https://jira.yourdomain.tld)'
                }
                , 'jira_jql_velocity': {
                    'type': ['string']
                    , 'description': 'JIRA JQL Query used to track story points completion '
                                     '(for example: project = WORK and status changed to Done)'
                }
                , 'jira_jql_remaining': {
                    'type': ['string']
                    , 'description': 'JIRA JQL Query used to determine remaining work '
                                     '(for example: sprint in openSprints() and type in (Story, Task, Defect))'
                }
                , 'jira_field_points': {
                    'type': ['string']
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
                , 'rolling_stats': {
                    'type': 'array'
                    , 'description': 'Array of weeks to group stats by. For example average over the past 4 weeks, past 8 weeks etc...'
                    , 'default': [4, 8]
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

    @property
    def filename_cache_completion(self):
        return self.__filename_cache_completion

    @property
    def filename_cache_remaining(self):
        return self.__filename_cache_remaining

    @property
    def filename_stats_days(self):
        return self.__filename_stats_days

    @property
    def filename_stats_weeks(self):
        return self.__filename_stats_weeks

    @property
    def filename_stats_remaining(self):
        return self.__filename_stats_remaining

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

    @property
    def config_path(self):
        return self.__config_path

    def get_config_value(self, key):
        return self.config[key]

    def set_config_value(self, key, value):
        """Updates a key/value pair in the config, verify it against the schema before updating config"""
        value_init = None
        if self.config is not None and key in self.config:
            value_init = self.config[key]
        config_tmp = copy.deepcopy(self.config)
        config_tmp[key] = value
        self.config = config_tmp
        self.log.info(
            'Updated config: ' + key + ' from: ' + str(value_init) + ' to: ' + str(value))
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

    def init_config(self):
        self.log.info('Unable to find config file, initializing')
        self.log.info('Press Enter for [default], CTRL+C to exit')
        config_schema = self.schema['properties']
        for config_key in config_schema:
            config_value = self.init_config_value(config_key)
            self.set_config_value(config_key, config_value)
        self.write_config()

    def init_config_value(self, config_key):
        value_default = None
        value_current = None
        value_suggested = None
        if 'default' in self.schema['properties'][config_key]:
            value_default = self.schema['properties'][config_key]['default']

        if self.config is not None and config_key in self.config:
            value_current = self.config[config_key]

        self.log.info(config_key + ' - ' + self.schema['properties'][config_key]['description'])
        self.log.info('Current Value: ' + str(value_current) + ' Default Value: ' + str(value_default))
        if value_current is None and value_default is not None:
            value_suggested = value_default
        elif value_current is not None:
            value_suggested = value_current
        config_value = input('[' + str(value_suggested) + ']:')

        if config_value == '' and value_suggested is not None:
            config_value = value_suggested
        elif config_value == '' and 'null' not in self.schema['properties'][config_key]['type']:
            self.log.warn('This value cannot be empty, please enter a value')
            config_value = self.init_config_value(config_key)

        if 'string' in self.schema['properties'][config_key]['type']:
            config_value = str(config_value)
        elif 'number' in self.schema['properties'][config_key]['type']:
            config_value = int(config_value)

        return config_value

