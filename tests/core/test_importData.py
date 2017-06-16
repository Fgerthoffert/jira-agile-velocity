from unittest import TestCase
import mock
from jav.core.javImportData import ImportData
from jav.core.javConfig import Config
from jav.core.javJira import Jira
from datetime import timedelta, datetime
import collections
from cement.core import foundation

class TestImportData(TestCase):

    def get_app(self):
        """App init, necessary to get to the logging service"""
        app = foundation.CementApp('myapp')
        app.setup()
        app.run()
        return app

    def get_jira_issues(self):
        """Return a simplify list simulating a JIRA response"""
        jira_issues = [
            {'fields': {'issuetype': {'name': 'defect'}, 'jira_points_field': 10}}
            , {'fields': {'issuetype': {'name': 'defect'}, 'jira_points_field': 20}}
            , {'fields': {'issuetype': {'name': 'defect'}}}
            , {'fields': {'issuetype': {'name': 'story'}, 'jira_points_field': 2}}
            , {'fields': {'issuetype': {'name': 'story'}, 'jira_points_field': 5}}
        ]
        return jira_issues

    def get_data_completion(self):
        data = collections.OrderedDict()
        data['2017-05-25'] = {
            'datetime': datetime.strptime('2017-05-25', '%Y-%m-%d').date()
            , 'tickets': 10
            , 'points': 15
            , 'assignees': {
                'johnd': {'tickets': 2, 'points': 3, 'displayName': 'John Doe'}
                , 'brucew': {'tickets': 3, 'points': 7, 'displayName': 'Bruce Wayne'}
                , 'darthv': {'tickets': 5, 'points': 5, 'displayName': 'Darth Vader'}
            }
            , 'types': {
                'Defect': {'tickets': 7, 'points': 1, 'type': 'Defect'}
                , 'Story': {'tickets': 1, 'points': 10, 'type': 'Story'}
                , 'Task': {'tickets': 2, 'points': 4, 'type': 'Task'}
            }
        }
        data['2017-05-24'] = {
            'datetime': datetime.strptime('2017-05-24', '%Y-%m-%d').date()
            , 'tickets': 4
            , 'points': 30
            , 'assignees': {
                'johnd': {'tickets': 1, 'points': 10, 'displayName': 'John Doe'}
                , 'darthv': {'tickets': 3, 'points': 20, 'displayName': 'Darth Vader'}
            }
            , 'types': {
                'Defect': {'tickets': 2, 'points': 14, 'type': 'Defect'}
                , 'Story': {'tickets': 2, 'points': 16, 'type': 'Story'}
            }
        }
        data['2017-05-23'] = {
            'datetime': datetime.strptime('2017-05-23', '%Y-%m-%d').date()
            , 'tickets': 8
            , 'points': 20
            , 'assignees': {
                'johnd': {'tickets': 2, 'points': 5, 'displayName': 'John Doe'}
                , 'brucew': {'tickets': 2, 'points': 10, 'displayName': 'Bruce Wayne'}
                , 'darthv': {'tickets': 4, 'points': 5, 'displayName': 'Darth Vader'}
            }
            , 'types': {
                'Defect': {'tickets': 1, 'points': 7, 'type': 'Defect'}
                , 'Story': {'tickets': 3, 'points': 19, 'type': 'Story'}
                , 'Task': {'tickets': 4, 'points': 4, 'type': 'Task'}
            }
        }
        return data

    @mock.patch('jav.core.javConfig')
    def test_get_story_point(self, mock_config):
        #mock_config.get_config_value.return_value = 'jira_points_field'
        mock_config.get_config_value = mock.MagicMock(return_value='jira_points_field')

        # App init, necessary to get to the logging service
        app = self.get_app()

        # Init the Import Data Class
        import_data = ImportData(app.log, mock_config)

        # If field exists and send 1, should return 1
        self.assertEqual(import_data.get_story_points({'fields':{'jira_points_field': 1}}), 1)
        # If field does not exist and send 1, should return none
        self.assertEqual(import_data.get_story_points({'fields':{'does_not_exist': 1}}), None)


    @mock.patch('jav.core.javConfig')
    def test_story_types_count(self, mock_config):
        mock_config.get_config_value = mock.MagicMock(return_value='jira_points_field')

        # App init, necessary to get to the logging service
        app = self.get_app()

        # Init the Import Data Class
        import_data = ImportData(app.log, mock_config)

        # Send a couple of issues and ensure returned value are correct
        self.assertEqual(import_data.story_types_count(self.get_jira_issues()), {'story': {'tickets': 2, 'points': 7, 'type': 'story'}, 'defect': {'tickets': 3, 'points': 30, 'type': 'defect'}})

    @mock.patch('jav.core.javJira.get_completed_tickets')
    @mock.patch('jav.core.javConfig')
    def test_refresh_dailydata_cache(self, mock_config, mock_jira_call):
        mock_config.get_config_value = mock.MagicMock(return_value='jira_points_field')
        mock_jira_call = mock.MagicMock(return_value=self.get_data_completion())

        #self.jira.get_completed_tickets(date_current)

        # App init, necessary to get to the logging service
        app = self.get_app()

        #app.log.info(self.get_data_completion())
        app.log.info(mock_jira_call)

        import_data = ImportData(app.log, mock_config)
        import_data.refresh_dailydata_cache(self.get_data_completion(), datetime.strptime('2017-05-26', '%Y-%m-%d').date(), datetime.strptime('2017-05-21', '%Y-%m-%d').date())

    #def refresh_dailydata_cache(self, previous_data_cache, date_start, date_end):
