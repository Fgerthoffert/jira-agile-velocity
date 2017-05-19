"""Testing utilities for Jira Agile Velocity."""

from jav.cli.main import javTestApp
from cement.utils.test import *

class javTestCase(CementTestCase):
    app_class = javTestApp

    def setUp(self):
        """Override setup actions (for every test)."""
        super(javTestCase, self).setUp()

    def tearDown(self):
        """Override teardown actions (for every test)."""
        super(javTestCase, self).tearDown()

