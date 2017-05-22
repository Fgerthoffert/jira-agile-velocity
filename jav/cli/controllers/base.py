"""Jira Agile Velocity base controller."""

from cement.ext.ext_argparse import ArgparseController, expose

from jav.core.javRun import Run

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

    @expose(help='Use this command to run the script')
    def run(self):
        run = Run(self.app.log)
        run.main()