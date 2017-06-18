from unittest import TestCase
import mock
from jav.core.javTime import Time
from datetime import datetime
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
        answer_date = datetime.now(pytz.timezone('America/Toronto')).strftime('%Y-%m-%d')
        response_date = Time.get_current_date().strftime('%Y-%m-%d')
        self.assertEqual(answer_date, response_date)

    @mock.patch('jav.core.javConfig')
    def test_get_end_date(self, mock_config):
        mock_config.get_config_value = mock.MagicMock(return_value='2017-01-22')

        # App init, necessary to get to the logging service
        app = self.get_app()

        time = Time(app.log, mock_config)

        end_date_answer = datetime.strptime('2017-01-22', "%Y-%m-%d").date()
        end_date_response = time.get_end_date()

        self.assertEqual(end_date_answer, end_date_response)



