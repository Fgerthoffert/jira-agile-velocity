from unittest import TestCase
import mock
from jav.core.javTime import Time
from datetime import datetime
import collections
import pytz
from cement.core import foundation

class TestTime(TestCase):

    @classmethod
    def get_app(self):
        """App init, necessary to get to the logging service"""
        app = foundation.CementApp('myapp')
        app.setup()
        app.run()
        return app

    def test_get_current_date(self):
        # App init, necessary to get to the logging service
        answer_date = datetime.now(pytz.timezone('America/Toronto')).strftime('%Y-%m-%d')
        response_date = Time.get_current_date().strftime('%Y-%m-%d')
        self.assertEqual(answer_date, response_date)




