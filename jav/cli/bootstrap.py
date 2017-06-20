"""Jira Agile Velocity bootstrapping."""

# All built-in application controllers should be imported, and registered
# in this file in the same way as javBaseController.

from jav.cli.controllers.base import javBaseController

def load(app):
    app.handler.register(javBaseController)
