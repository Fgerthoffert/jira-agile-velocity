from unittest import TestCase
import mock
from jav.core.javImportData import ImportData
from jav.core.javConfig import Config
from cement.core import foundation

class TestImportData(TestCase):

    @mock.patch('jav.core.javConfig')
    def test_get_story_point(self, mock_config):
        #mock_config.get_config_value.return_value = 'jira_points_field'
        mock_config.get_config_value = mock.MagicMock(return_value='jira_points_field')

        # App init, necessary to get to the logging service
        app = foundation.CementApp('myapp')
        app.setup()
        app.run()

        # Init the Import Data Class
        import_data = ImportData(app.log, mock_config)

        # If field exists and send 1, should return 1
        self.assertEqual(import_data.get_story_points({'fields':{'jira_points_field': 1}}), 1)
        # If field does not exist and send 1, should return none
        self.assertEqual(import_data.get_story_points({'fields':{'does_not_exist': 1}}), None)


    @mock.patch('jav.core.javConfig')
    def test_story_types_count(self, mock_Config):
        mock_Config.get_config_value.return_value = 'jira_points_field'

        # App init, necessary to get to the logging service
        app = foundation.CementApp('myapp')
        app.setup()
        app.run()

        # Init the Import Data Class
        import_data = ImportData(app.log, mock_Config)
        jira_issues = [
            {'fields': {'issuetype': {'name': 'defect'}, 'jira_points_field': 10}}
            , {'fields': {'issuetype': {'name': 'defect'}, 'jira_points_field': 20}}
            , {'fields': {'issuetype': {'name': 'defect'}}}
            , {'fields': {'issuetype': {'name': 'story'}, 'jira_points_field': 2}}
            , {'fields': {'issuetype': {'name': 'story'}, 'jira_points_field': 5}}
        ]

        # Send a couple of issues and ensure returned value are correct
        self.assertEqual(import_data.story_types_count(jira_issues), {'story': {'tickets': 2, 'points': 7, 'type': 'story'}, 'defect': {'tickets': 3, 'points': 30, 'type': 'defect'}})