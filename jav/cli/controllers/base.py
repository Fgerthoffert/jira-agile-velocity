"""Jira Agile Velocity base controller."""

from cement.ext.ext_argparse import ArgparseController, expose

from jav.core.javRun import Run
from jav.core.javSetup import Setup

class javBaseController(ArgparseController):
    class Meta:
        label = 'base'
        description = 'Connect to Jira REST API to collect completed story points, calculate weekly velocity, and estimate completion date'
        arguments = [
            (
                ['-d', '--dry-run'],
                dict(help='Do not send message to slack', action='store_true')
            )
        ]

    @expose(help='Get data, crunch numbers, do stuff')
    def run(self):
        run = Run(self.app.log, self.app.pargs.dry_run)
        run.main()

    @expose(help='Enter setup mode and provide configuration parameters (jira creds, slack details)')
    def setup(self):
        setup = Setup(self.app.log)
        setup.main()
