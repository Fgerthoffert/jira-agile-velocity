from unittest import TestCase
import mock
from jav.core.javImportData import ImportData
from jav.core.javConfig import Config
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


        # if os.path.isfile(filepath):
        #     for line in open(filepath).readlines():
        #         current_line = json.loads(line)
        #         current_line['datetime'] = dateutil.parser.parse(current_line['datetime'])
        #         dict_idx = current_line['datetime'].strftime('%Y%m%d')
        #         data[dict_idx] = current_line

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
    def test_story_types_count(self, mock_Config):
        mock_Config.get_config_value.return_value = 'jira_points_field'

        # App init, necessary to get to the logging service
        app = self.get_app()

        # Init the Import Data Class
        import_data = ImportData(app.log, mock_Config)

        # Send a couple of issues and ensure returned value are correct
        self.assertEqual(import_data.story_types_count(self.get_jira_issues()), {'story': {'tickets': 2, 'points': 7, 'type': 'story'}, 'defect': {'tickets': 3, 'points': 30, 'type': 'defect'}})

    @mock.patch('jav.core.javConfig')
    def test_refresh_dailydata_cache(self, mock_Config):
        mock_Config.get_config_value.return_value = 'jira_points_field'

        # App init, necessary to get to the logging service
        app = self.get_app()

        app.log.info(self.get_data_completion())
        #def refresh_dailydata_cache(self, previous_data_cache, date_start, date_end):

