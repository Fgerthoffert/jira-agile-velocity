"""Jira Agile Velocity base controller."""

from cement.ext.ext_argparse import ArgparseController, expose

class javBaseController(ArgparseController):
    class Meta:
        label = 'base'
        description = 'Connect to Jira REST API to collect completed story points, calculate weekly velocity, and estimate completion date'
        arguments = [
            (
                ['-d', '--dry-run'],
                dict(help='Do not send message to slack', dest='foo', action='store')
            )
        ]

    @expose(help="Use this command to run the script")
    def run(self):
        self.app.log.info("Inside MyBaseController.command1()")


