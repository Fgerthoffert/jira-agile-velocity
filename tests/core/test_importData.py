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
        jira_issues = {
            'issues': [
                {'fields': {'issuetype': {'name': 'defect'}, 'jira_points_field': 10, 'assignee': {'name': 'johnd', 'displayName': 'John Doe'}}}
                , {'fields': {'issuetype': {'name': 'defect'}, 'jira_points_field': 20, 'assignee': {'name': 'brucew', 'displayName': 'Bruce Wayne'}}}
                , {'fields': {'issuetype': {'name': 'defect'}, 'assignee': {'name': 'darthv', 'displayName': 'Darth Vader'}}}
                , {'fields': {'issuetype': {'name': 'story'}, 'jira_points_field': 2, 'assignee': {'name': 'brucew', 'displayName': 'Bruce Wayne'}}}
                , {'fields': {'issuetype': {'name': 'story'}, 'jira_points_field': 5, 'assignee': {'name': 'darthv', 'displayName': 'Darth Vader'}}}
            ]
        }
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
        self.assertEqual(import_data.story_types_count(self.get_jira_issues()['issues']), {'story': {'tickets': 2, 'points': 7, 'type': 'story'}, 'defect': {'tickets': 3, 'points': 30, 'type': 'defect'}})

    @mock.patch('jav.core.javConfig')
    def test_count_story_points(self, mock_config):
        mock_config.get_config_value = mock.MagicMock(return_value='jira_points_field')
        points_per_story = 3
        expected_result = points_per_story*len(self.get_jira_issues()['issues'])

        # App init, necessary to get to the logging service
        app = self.get_app()

        # Init the Import Data Class
        import_data = ImportData(app.log, mock_config)
        import_data.get_story_points = mock.MagicMock(return_value=points_per_story)
        self.assertEqual(import_data.count_story_points(self.get_jira_issues()['issues']), expected_result)

    @mock.patch('jav.core.javConfig')
    def test_assignee_count(self, mock_config):
        # App init, necessary to get to the logging service
        app = self.get_app()

        # Init the Import Data Class
        import_data = ImportData(app.log, mock_config)

        app.log.info(import_data.assignee_count(self.get_jira_issues()['issues']))
        # Send a couple of issues and ensure returned value are correct
        #self.assertEqual(import_data.assignee_count(self.get_jira_issues()['issues']), {'issues': [{'fields': {'issuetype': {'name': 'defect'}, 'assignee': {'displayName': 'John Doe', 'name': 'johnd'}, 'jira_points_field': 10}}, {'fields': {'issuetype': {'name': 'defect'}, 'assignee': {'displayName': 'Bruce Wayne', 'name': 'brucew'}, 'jira_points_field': 20}}, {'fields': {'issuetype': {'name': 'defect'}, 'assignee': {'displayName': 'Darth Vader', 'name': 'darthv'}}}, {'fields': {'issuetype': {'name': 'story'}, 'assignee': {'displayName': 'Bruce Wayne', 'name': 'brucew'}, 'jira_points_field': 2}}, {'fields': {'issuetype': {'name': 'story'}, 'assignee': {'displayName': 'Darth Vader', 'name': 'darthv'}, 'jira_points_field': 5}}]})


    @mock.patch('jav.core.javJira')
    @mock.patch('jav.core.javConfig')
    def test_refresh_dailydata_cache(self, mock_config, mock_jira):
        mock_config.get_config_value = mock.MagicMock(return_value='jira_points_field')
        mock_jira.get_completed_tickets = mock.MagicMock(return_value=self.get_jira_issues())

        # App init, necessary to get to the logging service
        app = self.get_app()

        import_data = ImportData(app.log, mock_config)
        import_data.jira = mock_jira

        response = import_data.refresh_dailydata_cache(self.get_data_completion(), datetime.strptime('2017-05-26', '%Y-%m-%d').date(), datetime.strptime('2017-05-21', '%Y-%m-%d').date())
        app.log.info(response)
