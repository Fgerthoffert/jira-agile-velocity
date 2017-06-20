from unittest import TestCase
from jav.core.javConfig import Config
from cement.core import foundation

class TestConfig(TestCase):

    @classmethod
    def get_app(self):
        """App init, necessary to get to the logging service"""
        app = foundation.CementApp('myapp')
        app.setup()
        app.run()
        return app

    @classmethod
    def get_config(self):
        config = {
            'end_date': '2017-02-01'
            , 'git_branch': 'gh-pages'
            , 'git_localpath': '/Users/USERNAME/Desktop/test-agile-page/'
            , 'git_pageurl': 'https://org.github.io/repo/dir/'
            , 'git_pathdirectory': 'dir/'
            , 'git_repo': 'https://github.com/org/repo.git'
            , 'jira_field_points': 'customfield_10002'
            , 'jira_host': 'https://URL'
            , 'jira_jql_remaining': 'JQL QUERY'
            , 'jira_jql_velocity': 'JQL QUERY'
            , 'jira_password': 'PASSWORD'
            , 'jira_username': 'USERNAME'
            , 'rolling_stats': [4, 8, 12]
            , 'slack_channel': '#general'
            , 'slack_webhook': 'SLACK WEBHOOK'
            , 'stats_metric': 'tickets'
        }
        return config

    def test_get_config_value(self):
        """Receives a parameter and test if a value can be returned"""
        # App init, necessary to get to the logging service
        app = self.get_app()
        config = Config(app.log, config_values = self.get_config())

        self.assertEqual(config.get_config_value('jira_jql_remaining'), 'JQL QUERY')

    def test_set_config_value(self):
        """Modifies configuration of a parameter and check output"""
        # App init, necessary to get to the logging service
        app = self.get_app()
        config = Config(app.log, config_values = self.get_config())

        self.assertEqual(config.get_config_value('jira_jql_remaining'), 'JQL QUERY')
        self.assertEqual(config.set_config_value('jira_jql_remaining', 'NEW JQL QUERY'), 'NEW JQL QUERY')
        self.assertEqual(config.get_config_value('jira_jql_remaining'), 'NEW JQL QUERY')

    def test_init_config_auto(self):
        """Automatically initialize the default config"""
        # App init, necessary to get to the logging service
        app = self.get_app()
        config = Config(app.log, config_values=self.get_config())
        self.assertEqual(config.get_config_value('jira_jql_remaining'), 'JQL QUERY')
        config.init_config_auto()
        self.assertEqual(config.get_config_value('jira_jql_remaining'), 'JQL QUERY REMAINING')

