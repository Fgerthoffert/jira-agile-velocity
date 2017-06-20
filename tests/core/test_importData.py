from unittest import TestCase
import mock
from jav.core.javImportData import ImportData
from jav.core.javConfig import Config
from jav.core.javJira import Jira
from jav.core.javFiles import Files
from datetime import datetime
import collections
from cement.core import foundation

class TestImportData(TestCase):

    @classmethod
    def get_app(self):
        """App init, necessary to get to the logging service"""
        app = foundation.CementApp('myapp')
        app.setup()
        app.run()
        return app

    @classmethod
    def get_jira_issues(self):
        """Return a simple list of issues simulating a JIRA response"""
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

    @classmethod
    def get_data_completion(self):
        data = collections.OrderedDict()
        data['20170525'] = {
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
        data['20170524'] = {
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
        data['20170523'] = {
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

    @classmethod
    def get_data_completion_answer(self):
        data = collections.OrderedDict()
        data['20170526'] = {
            'datetime': datetime.strptime('2017-05-26', '%Y-%m-%d').date()
            , 'tickets': 5
            , 'points': 37
            , 'assignees': {
                'johnd': {'tickets': 1, 'points': 10, 'displayName': 'John Doe'}
                , 'brucew': {'tickets': 2, 'points': 22, 'displayName': 'Bruce Wayne'}
                , 'darthv': {'tickets': 2, 'points': 5, 'displayName': 'Darth Vader'}
            }
            , 'types': {
                'defect': {'tickets': 3, 'points': 30, 'type': 'defect'}
                , 'story': {'tickets': 2, 'points': 7, 'type': 'story'}
            }
        }
        data['20170525'] = self.get_data_completion()['20170525']
        data['20170524'] = self.get_data_completion()['20170524']
        data['20170523'] = self.get_data_completion()['20170523']
        data['20170522'] = {
            'datetime': datetime.strptime('2017-05-22', '%Y-%m-%d').date()
            , 'tickets': 5
            , 'points': 37
            , 'assignees': {
                'johnd': {'tickets': 1, 'points': 10, 'displayName': 'John Doe'}
                , 'brucew': {'tickets': 2, 'points': 22, 'displayName': 'Bruce Wayne'}
                , 'darthv': {'tickets': 2, 'points': 5, 'displayName': 'Darth Vader'}
            }
            , 'types': {
                'defect': {'tickets': 3, 'points': 30, 'type': 'defect'}
                , 'story': {'tickets': 2, 'points': 7, 'type': 'story'}
            }
        }
        return data

    @classmethod
    def get_remaining_work_answer(self):
        response = {
            'tickets': 5
            , 'points': 37
            , 'assignees': {
               'johnd': {'tickets': 1, 'points': 10, 'displayName': 'John Doe'}
               , 'brucew': {'tickets': 2, 'points': 22, 'displayName': 'Bruce Wayne'}
               , 'darthv': {'tickets': 2, 'points': 5, 'displayName': 'Darth Vader'}
            }
            , 'types': {
                'defect': {'tickets': 3, 'points': 30, 'type': 'defect'}
                , 'story': {'tickets': 2, 'points': 7, 'type': 'story'}
            }
        }
        return response

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
        mock_config.get_config_value = mock.MagicMock(return_value='jira_points_field')
        # App init, necessary to get to the logging service
        app = self.get_app()

        # Init the Import Data Class
        import_data = ImportData(app.log, mock_config)

        assignee_count_answer = {
            'johnd': {'displayName': 'John Doe', 'points': 10, 'tickets': 1}
            , 'brucew': {'displayName': 'Bruce Wayne', 'points': 22, 'tickets': 2}
            , 'darthv': {'displayName': 'Darth Vader', 'points': 5, 'tickets': 2}
        }
        assignee_count_response = import_data.assignee_count(self.get_jira_issues()['issues'])

        # Send a couple of issues and ensure returned value are correct
        self.assertEqual(assignee_count_response, assignee_count_answer)

    @mock.patch('jav.core.javJira')
    @mock.patch('jav.core.javConfig')
    def test_refresh_dailydata_cache(self, mock_config, mock_jira):
        mock_config.get_config_value = mock.MagicMock(return_value='jira_points_field')
        mock_jira.get_completed_tickets = mock.MagicMock(return_value=self.get_jira_issues())

        start_date = datetime.strptime('2017-05-28', '%Y-%m-%d').date()
        end_date = datetime.strptime('2017-05-21', '%Y-%m-%d').date()

        # App init, necessary to get to the logging service
        app = self.get_app()

        import_data = ImportData(app.log, mock_config)
        import_data.jira = mock_jira

        # To simplify formatting, re-run the full expected answer through the function
        refresh_daily_data_cache_response = import_data.refresh_dailydata_cache(self.get_data_completion(), start_date, end_date)

        self.assertDictEqual(refresh_daily_data_cache_response, self.get_data_completion_answer())

    @mock.patch('jav.core.javFiles.Files')
    @mock.patch('jav.core.javJira')
    @mock.patch('jav.core.javConfig')
    def test_get_remaining_work(self, mock_config, mock_jira, mock_files):
        mock_config.get_config_value = mock.MagicMock(return_value='jira_points_field')
        mock_jira.get_remaining_tickets = mock.MagicMock(return_value=self.get_jira_issues())
        mock_files.json_write = mock.MagicMock(return_value=True)

        # App init, necessary to get to the logging service
        app = self.get_app()

        import_data = ImportData(app.log, mock_config)
        import_data.jira = mock_jira
        import_data.files = mock_files

        get_remaining_work_answer = {
            'points': 37
            , 'tickets': 5
            , 'types': {
                'defect': {'type': 'defect', 'points': 30, 'tickets': 3}
                , 'story': {'type': 'story', 'points': 7, 'tickets': 2}
            }
            , 'assignees': {
                'johnd': {'displayName': 'John Doe', 'points': 10, 'tickets': 1}
                , 'brucew': {'displayName': 'Bruce Wayne', 'points': 22, 'tickets': 2}
                , 'darthv': {'displayName': 'Darth Vader', 'points': 5, 'tickets': 2}
            }
        }
        self.assertDictEqual(import_data.get_remaining_work(), get_remaining_work_answer)


