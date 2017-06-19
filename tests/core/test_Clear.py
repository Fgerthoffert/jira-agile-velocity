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
        self.assertEqual(clear.main(), True)





