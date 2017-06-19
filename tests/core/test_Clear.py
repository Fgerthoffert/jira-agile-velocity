from unittest import TestCase
from jav.core.javClear import Clear
import mock
from cement.core import foundation

class TestClear(TestCase):

    @classmethod
    def get_app(self):
        """App init, necessary to get to the logging service"""
        app = foundation.CementApp('myapp')
        app.setup()
        app.run()
        return app

    @mock.patch('jav.core.javConfig')
    def test_main(self, mock_config):
        """This is a dummy test, only verifies that the function exists and return True"""
        # App init, necessary to get to the logging service
        app = self.get_app()

        clear = Clear(app.log, mock_config)
        mock_config.filepath_data_completion = '/thispathdoesnotexist/'

        self.assertEqual(clear.main(), True)

    # @mock.patch('os.path.isdir')
    # @mock.patch('os.path.isfile')
    # @mock.patch('jav.core.javConfig.Config.load_config')
    # def test_get_config_value(self, mock_conf_load, mock_isfile, mock_isdir):
    #     """Receives a parameter and test if a value can be returned"""
    #     # App init, necessary to get to the logging service
    #     app = self.get_app()
    #     #mock_isfile.return_value = True
    #     #mock_isdir.return_value = True
    #     mock_conf_load.return_value = self.get_config()
    #
    #     config = Config(app.log, config_values = self.get_config())
    #
    #     self.assertEqual(config.get_config_value('jira_jql_remaining'), 'JQL QUERY')



