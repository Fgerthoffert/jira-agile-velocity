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

    def __init__(self, log, config_path = expanduser('~') + '/.jav/', config_values = None):
        self.log = log
        self.__config_path = self.prep_config_path(config_path)
        self.__config_filename = 'config.yml'
        self.__config_filepath = self.__config_path + self.__config_filename

        self.__filepath_data_completion = self.__config_path + 'data_completion.jsonl'
        self.__filepath_data_remaining = self.__config_path + 'data_remaining.json'

        self.__filepath_stats_days = self.__config_path + 'stats_days.jsonl'
        self.__filepath_stats_weeks = self.__config_path + 'stats_weeks.jsonl'
        self.__filepath_stats_remaining = self.__config_path + 'stats_remaining.jsonl'

        self.__filepath_charts = self.prep_config_path(self.__config_path + 'built-charts/')

        # config_init is used to record if the init method was once called
        self.__config_init = False

        self.__config = config_values
        self.__schema = {
            '$schema': 'http://json-schema.org/draft-04/schema#'
            , 'title': 'configObj'
            , 'description': 'Configuration values '
            , 'type': 'object'
            , 'additionalProperties': False
            , 'properties': {
                'end_date': {
                    'type': ['string']
                    , 'description': 'Earliest date to collect data from'
                    , 'default': '2017-01-01'
                }
                , 'jira_username': {
                    'type': ['string']
                    , 'description': 'JIRA Username used for the API call'
                    , 'default': 'USERNAME'
                }
                , 'jira_password': {
                    'type': ['string']
                    , 'description': 'JIRA Password used for the API call'
                    , 'default': 'PASSWORD'
                }
                , 'jira_host': {
                    'type': ['string']
                    , 'description': 'Remote JIRA Hostname (https://jira.yourdomain.tld)'
                    , 'default': 'HOST'
                }
                , 'jira_jql_velocity': {
                    'type': ['string']
                    , 'description': 'JIRA JQL Query used to track story points completion '
                                     '(for example: project = WORK and status changed to Done)'
                    , 'default': 'JQL QUERY VELOCITY'
                }
                , 'jira_jql_remaining': {
                    'type': ['string']
                    , 'description': 'JIRA JQL Query used to determine remaining work '
                                     '(for example: sprint in openSprints() and type in (Story, Task, Defect))'
                    , 'default': 'JQL QUERY REMAINING'
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
                    , 'default': 'SLACK WEBHOOK'
                }
                , 'rolling_stats': {
                    'type': 'array'
                    , 'description': 'Array of weeks to group stats by. For example average over the past 4 weeks, past 8 weeks etc...'
                    , 'default': [4, 8]
                }
                , 'stats_metric': {
                    'type': 'string'
                    , 'description': 'Type of metric to be used to calculate stats, build charts and messages (points or tickets)'
                    , 'default': 'points'
                }
                , 'git_repo': {
                    'type': ['string', 'null']
                    , 'description': 'Git repository to be used to publish charts'
                    , 'default': 'https://github.com/Fgerthoffert/test-agile-page.git'
                }
                , 'git_branch': {
                    'type': ['string', 'null']
                    , 'description': 'Git branch for the charts'
                    , 'default': 'gh-pages'
                }
                , 'git_localpath': {
                    'type': ['string', 'null']
                    , 'description': 'Path of the git directory on the local filesystem'
                    , 'default': '/Users/francois/Desktop/test-agile-page/'
                }
                , 'git_pathdirectory': {
                    'type': ['string', 'null']
                    , 'description': 'Directory path, within localpath to be used to copy files'
                    , 'default': 'charts/'
                }
                , 'git_pageurl': {
                    'type': ['string', 'null']
                    , 'description': 'URL of the page to be sent via slack'
                    , 'default': 'https://fgerthoffert.github.io/test-agile-page/charts/'
                }
            }
        }

        if self.config is not None:
            self.log.info('Default configuration provided as part of class initialization')
        elif os.path.isdir(self.__config_path) is False or os.path.isfile(self.__config_filepath) is False:
            self.__config_init = self.init_config()
        elif os.path.isfile(self.__config_filepath):
            self.load_config()

    @staticmethod
    def prep_config_path(config_path):
        if config_path is None:
            config_path = expanduser('~') + '/.jav/'
        elif config_path[-1] != '/':
            config_path = config_path + '/'
        if not os.path.isdir(config_path):
            try:
                os.makedirs(config_path)
            except Exception as ex:
                print('Directory: ' + config_path + ' already exists')
                print(ex.message)
        return config_path

    @property
    def schema(self):
        return self.__schema

    @property
    def config_init(self):
        return self.__config_init

    @property
    def filepath_data_completion(self):
        return self.__filepath_data_completion

    @property
    def filepath_data_remaining(self):
        return self.__filepath_data_remaining

    @property
    def filepath_stats_days(self):
        return self.__filepath_stats_days

    @property
    def filepath_stats_weeks(self):
        return self.__filepath_stats_weeks

    @property
    def filepath_stats_remaining(self):
        return self.__filepath_stats_remaining

    @property
    def filepath_charts(self):
        return self.__filepath_charts

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

    @property
    def config_path(self):
        return self.__config_path

    def get_config_value(self, key):
        """Get a single value of the dictionary"""
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
        """Manually initialize configuration"""
        self.log.info('Unable to find config file, initializing')
        self.log.info('Press Enter for [default], CTRL+C to exit')
        config_schema = self.schema['properties']
        for config_key in sorted(config_schema):
            config_value = self.init_config_value(config_key)
            self.set_config_value(config_key, config_value)
        self.write_config()
        return True

    def init_config_auto(self):
        """Automatically initializing configuration, setting all values to default"""
        config_schema = self.schema['properties']
        for config_key in sorted(config_schema):
            self.set_config_value(config_key, config_schema[config_key]['default'])
        return True

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

        # Note: https://stackoverflow.com/questions/10885537/raw-input-has-been-eliminated-from-python-3-2
        # https://stackoverflow.com/questions/21731043/use-of-input-raw-input-in-python-2-and-3
        try:
            input = raw_input
        except NameError:
            pass

        try:
            config_value = input('[' + str(value_suggested) + ']:')
        except Exception as ex:
            # If exception, we consider the value to be empty (fallback to default)
            self.log.debug(ex.message)
            config_value = ''

        self.log.debug('Received value: ' + config_value)

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

