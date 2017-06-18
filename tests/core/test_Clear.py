from unittest import TestCase
import mock
from jav.core.javClear import Clear
from datetime import datetime
import pytz
from cement.core import foundation

class TestClear(TestCase):

    @classmethod
    def get_app(self):
        """App init, necessary to get to the logging service"""
        app = foundation.CementApp('myapp')
        app.setup()
        app.run()
        return app

    def test_main(self):
        """This is a dummy test, only verifies that the function exists and return True"""
        # App init, necessary to get to the logging service
        app = self.get_app()
        clear = Clear(app.log, app.config)

        self.assertEqual(clear.main(), True)





