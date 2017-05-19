"""Tests for Example Plugin."""

from jav.utils import test

class ExamplePluginTestCase(test.javTestCase):
    def test_load_example_plugin(self):
        self.app.setup()
        self.app.plugin.load_plugin('example')
