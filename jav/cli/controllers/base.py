"""Jira Agile Velocity base controller."""

from cement.ext.ext_argparse import ArgparseController, expose

from jav.core.javSetup import Setup
from jav.core.javClear import Clear
from jav.core.javCrunch import Crunch
from jav.core.javLoad import Load
from jav.core.javConfig import Config
from jav.core.javLogConfig import LogConfig
from jav.core.javBuildChart import BuildChart
from jav.core.javPublishGithubPage import PublishGithubPage
from jav.core.javMsg import Msg


class javBaseController(ArgparseController):

    class Meta:
        label = 'base'
        description = 'Connect to Jira REST API to collect completed story points, calculate weekly velocity, and estimate completion date'
        arguments = [
            (
                ['-s', '--send'],
                dict(help='Send message to slack, by default prints to console', action='store_true')
            ),
            (
                ['-p', '--path'],
                dict(help='Path to the directory storing data and config, will be created if does not exist', action='store', dest='path_config')
            )
        ]

    @expose(help='Clear previous data (USE WITH CAUTION)')
    def clear(self):
        config = Config(self.app.log, self.app.pargs.path_config)
        LogConfig(self.app.log, self.app.config, config.config_path + 'clear.log')

        clear = Clear(self.app.log, config)
        clear.main()

    @expose(help='Enter setup mode and provide configuration parameters (jira creds, slack details)')
    def setup(self):
        setup = Setup(self.app.log, self.app.config)
        setup.main()

    @expose(help='Load latest data from Jira into cache')
    def load(self):
        config = Config(self.app.log, self.app.pargs.path_config)
        LogConfig(self.app.log, self.app.config, config.config_path + 'load.log')

        load = Load(self.app.log, self.app.config)
        load.refresh_jira_cache()

    @expose(help='Obtain updated data from Jira and crunch numbers')
    def crunch(self):
        config = Config(self.app.log, self.app.pargs.path_config)
        LogConfig(self.app.log, self.app.config, config.config_path + 'crunch.log')

        # Loading saved files into memory to be used by the component crunching numbers
        load = Load(self.app.log, self.app.config)
        daily_data, remaining_work = load.load_jira_cache()

        crunch = Crunch(self.app.log, config)
        crunch.crunch_stats(daily_data, remaining_work)

    @expose(help='Create charts from cached data')
    def chart(self):
        config = Config(self.app.log, self.app.pargs.path_config)
        LogConfig(self.app.log, self.app.config, config.config_path + 'chart.log')

        #Get previously crunched number from cache file
        crunch = Crunch(self.app.log, config)
        stats_days, stats_weeks, stats_remaining = crunch.load_stats_cache()

        #Build charts
        BuildChart(self.app.log, config).main(stats_days, stats_weeks, stats_remaining)

    @expose(help='Publish charts to github pages')
    def publish(self):
        config = Config(self.app.log, self.app.pargs.path_config)
        LogConfig(self.app.log, self.app.config, config.config_path + 'publish.log')

        PublishGithubPage(self.app.log, config).main()

    @expose(help='Send latest stats to the team on Slack')
    def msg(self):
        config = Config(self.app.log, self.app.pargs.path_config)
        LogConfig(self.app.log, self.app.config, config.config_path + 'msg.log')

        #Get previously crunched number from cache file
        crunch = Crunch(self.app.log, config)
        stats_days, stats_weeks, stats_remaining = crunch.load_stats_cache()

        Msg(self.app.log, config, self.app.pargs.send).publish(stats_days, stats_weeks, stats_remaining)

    @expose(help='Get data, crunch numbers, do stuff')
    def run(self):
        config = Config(self.app.log, self.app.pargs.path_config)
        LogConfig(self.app.log, self.app.config, config.config_path + 'run.log')

        # Load data from Jira
        load = Load(self.app.log, self.app.config)
        daily_data, remaining_work = load.refresh_jira_cache()

        # Crunch numbers
        crunch = Crunch(self.app.log, config)
        stats_days, stats_weeks, stats_remaining = crunch.crunch_stats(daily_data, remaining_work)

        # Build Chart
        BuildChart(self.app.log, config).main(stats_days, stats_weeks, stats_remaining)

        # Publish Chart
        PublishGithubPage(self.app.log, config).main()

        #Get previously crunched number from cache file, to avoid the issue with json index key conversion
        # Issue, there is no numerical indexes in json, only strings.
        stats_days, stats_weeks, stats_remaining = crunch.load_stats_cache()

        # Message Team
        Msg(self.app.log, config, self.app.pargs.send).publish(stats_days, stats_weeks, stats_remaining)




