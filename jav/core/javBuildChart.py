import numpy as np
import pandas as pd

try:
    from urllib import quote
except ImportError:
    from urllib.parse import quote

from bokeh.charts import output_file, save, show
from bokeh.layouts import layout
from bokeh.plotting import figure, ColumnDataSource
from bokeh.models import HoverTool, OpenURL, TapTool, FactorRange
from jav.core.javTime import Time


class BuildChart(object):
    def __init__(self, log, config):
        self.log = log
        self.config = config
        self.time = Time(self.log, self.config)

    def build_url_completed(self, current_date):
        return \
            self.config.get_config_value('jira_host') + '/issues/?jql=' \
            + quote(
                self.config.get_config_value('jira_jql_velocity')
                + ' ON(\"'
                + current_date.strftime("%Y-%m-%d")
                + '\")'
            )

    def build_url_remaining(self, jira_field, current_type):
        return \
            self.config.get_config_value('jira_host') + '/issues/?jql=' \
            + quote(
                self.config.get_config_value('jira_jql_remaining')
                + ' AND '
                + jira_field
                + ' = \"'
                + current_type
                + '\"'
            )

    def build_velocity_days(self, stats_data):
        self.log.info('Generating graph about daily effort')
        # Velocity Days
        x_dates = []
        y_values = []
        y_avg = []
        x_dates_display = []
        jira_url = []
        for scan_day in stats_data:
            x_dates.append(stats_data[scan_day]['datetime'])
            x_dates_display.append(stats_data[scan_day]['datetime'].strftime('%a %b %d, %Y'))
            y_values.append(stats_data[scan_day][self.config.get_config_value('stats_metric')])
            jira_url.append(self.build_url_completed(stats_data[scan_day]['datetime']))
            week_idx = '4'
            if week_idx not in stats_data[scan_day]['anyday']:
                week_idx = 4
            if 'avg' in stats_data[scan_day]['anyday'][week_idx]:
                y_avg.append(stats_data[scan_day]['anyday'][week_idx]['avg'])
            else:
                y_avg.append(0)
        # prepare some data
        data_dates = np.array(x_dates, dtype=np.datetime64)
        source = ColumnDataSource(
            data=dict(
                x_data_dates=data_dates,
                y_values=y_values,
                y_avg_values=y_avg,
                x_dates_display=x_dates_display,
                jira_url=jira_url
            )
        )
        # Declare tools
        hover = HoverTool(
            tooltips=[
                ('Date', '@x_dates_display'),
                (self.config.get_config_value('stats_metric').capitalize(), '@y_values'),
                ('Average', '@y_avg_values'),
            ]
        )
        # create a new plot with a a datetime axis type
        p = figure(width=1000, height=350, x_axis_type='datetime',
                   tools=['save', 'pan', 'box_zoom', 'reset', hover, 'tap'])
        if self.config.get_config_value('stats_metric') == 'tickets':
            metric_legend = 'Tickets'
        else:
            metric_legend = 'Story Points'
        # add renderers
        p.circle('x_data_dates', 'y_values', size=4, color='red', alpha=0.4, legend=metric_legend, source=source)
        p.line('x_data_dates', 'y_avg_values', color='blue', legend='4 Weeks Average', source=source)
        taptool = p.select(type=TapTool)
        taptool.callback = OpenURL(url='@jira_url')
        # NEW: customize by setting attributes
        p.title.text = 'Daily Velocity'
        p.legend.location = 'top_left'
        p.grid.grid_line_alpha = 0
        p.xaxis.axis_label = 'Days (Monday-Friday)'
        p.yaxis.axis_label = metric_legend
        p.ygrid.band_fill_color = 'olive'
        p.ygrid.band_fill_alpha = 0.1

        return p

    def build_velocity_weeks(self, stats_data):
        self.log.info('Generating graph about weekly effort')
        # Velocity Days
        x_dates = []
        y_values = []
        y_avg = []
        y_weeks = []
        daily_avg = []
        for scan_day in stats_data:
            x_dates.append(stats_data[scan_day]['datetime'])
            y_values.append(stats_data[scan_day][self.config.get_config_value('stats_metric')])
            y_weeks.append(stats_data[scan_day]['weektxt'])
            daily_avg.append(round(float(stats_data[scan_day][self.config.get_config_value('stats_metric')]) / 5, 1))
            if len(stats_data[scan_day]['stats']) > 0:
                week_idx = '4'
                if week_idx not in stats_data[scan_day]['stats']:
                    week_idx = 4
                if 'avg' in stats_data[scan_day]['stats'][week_idx]:
                    y_avg.append(stats_data[scan_day]['stats'][week_idx]['avg'])
                else:
                    y_avg.append(0)
        # prepare some data
        data_dates = np.array(x_dates, dtype=np.datetime64)
        source = ColumnDataSource(
            data=dict(
                x_data_dates=data_dates,
                y_values=y_values,
                y_avg_values=y_avg,
                y_weeks=y_weeks,
                daily_avg=daily_avg,
            )
        )
        # Declare tools
        hover = HoverTool(
            tooltips=[
                ('Week', '@y_weeks'),
                (self.config.get_config_value('stats_metric').capitalize(), '@y_values'),
                ('Avg ' + self.config.get_config_value('stats_metric') + ' per week', '@y_avg_values'),
                ('Avg ' + self.config.get_config_value('stats_metric') + ' per day', '@daily_avg'),
            ]
        )
        # create a new plot with a a datetime axis type
        p = figure(width=1000, height=350, x_axis_type='datetime', tools=['save', 'pan', 'box_zoom', 'reset', hover])
        if self.config.get_config_value('stats_metric') == 'tickets':
            metric_legend = 'Tickets'
        else:
            metric_legend = 'Story Points'
        # add renderers
        p.circle('x_data_dates', 'y_values', size=4, color='red', alpha=0.4, legend=metric_legend, source=source)
        p.line('x_data_dates', 'y_avg_values', color='blue', legend='4 Weeks Average', source=source)
        # NEW: customize by setting attributes
        p.title.text = 'Weekly Velocity'
        p.legend.location = 'top_left'
        p.grid.grid_line_alpha = 0
        p.xaxis.axis_label = 'Weeks'
        p.yaxis.axis_label = metric_legend
        p.ygrid.band_fill_color = 'olive'
        p.ygrid.band_fill_alpha = 0.1

        return p

    def get_points_per_type(self, stats_data):
        plot_values = []
        for scan_day in stats_data:
            total_metric = stats_data[scan_day][self.config.get_config_value('stats_metric')]
            for assignee in stats_data[scan_day]['types']:
                plot_values.append([
                    stats_data[scan_day]['types'][assignee]['type']
                    , stats_data[scan_day]['types'][assignee][self.config.get_config_value('stats_metric')]
                    , self.build_url_remaining('type', stats_data[scan_day]['types'][assignee]['type'])
                ])
            break
        return plot_values, total_metric

    @staticmethod
    def get_remaining_source(dat):
        source = ColumnDataSource(dict(
            x_values=dat.entity
            , y_values=dat.value
            , jira_url=dat.jira_url
        ))
        return source

    def chart_remaining_types(self, stats_data):
        self.log.info('Generating graph about remaining effort per ticket type')
        plot_values, total_metric = self.get_points_per_type(stats_data)
        dat = pd.DataFrame(plot_values, columns=['entity', 'value', 'jira_url'])
        source = self.get_remaining_source(dat)
        # Declare tools
        hover = HoverTool(
            tooltips=[
                ('Type:', '@x_values'),
                ('Points:', '@y_values')
            ]
        )
        plot = figure(
            plot_width=600
            , plot_height=300
            , x_axis_label='Ticket Type'
            , y_axis_label=self.config.get_config_value('stats_metric')
            , title='Remaining ' + self.config.get_config_value('stats_metric') + ' per Ticket Type (Total: ' + str(
                total_metric) + ')'
            , x_range=FactorRange(factors=list(dat.entity))
            , tools=['save', 'pan', 'box_zoom', 'reset', hover, 'tap']
        )
        taptool = plot.select(type=TapTool)
        taptool.callback = OpenURL(url='@jira_url')
        plot.vbar(source=source, x='x_values', top='y_values', bottom=0, width=0.3, color='green')
        return plot

    def get_points_per_assignee(self, stats_data):
        plot_values = []
        for scan_day in stats_data:
            total_metric = stats_data[scan_day][self.config.get_config_value('stats_metric')]
            for assignee in stats_data[scan_day]['assignees']:
                plot_values.append([
                    stats_data[scan_day]['assignees'][assignee]['displayName']
                    , stats_data[scan_day]['assignees'][assignee][self.config.get_config_value('stats_metric')]
                    , self.build_url_remaining('assignee', stats_data[scan_day]['assignees'][assignee]['displayName'])
                ])
            break
        return plot_values, total_metric

    def chart_remaining_assignees(self, stats_data):
        self.log.info('Generating graph about remaining effort per assignee')
        plot_values, total_metric = self.get_points_per_assignee(stats_data)

        dat = pd.DataFrame(plot_values, columns=['entity', 'value', 'jira_url'])
        source = self.get_remaining_source(dat)
        # Declare tools
        hover = HoverTool(
            tooltips=[
                ('Assignee:', '@x_values'),
                ('Points:', '@y_values')
            ]
        )
        plot = figure(
            plot_width=600
            , plot_height=300
            , x_axis_label='Assignee'
            , y_axis_label=self.config.get_config_value('stats_metric')
            , title='Remaining ' + self.config.get_config_value('stats_metric') + ' per Jira Assignee (Total: ' + str(
                total_metric) + ')'
            , x_range=FactorRange(factors=list(dat.entity))
            , tools=['save', 'pan', 'box_zoom', 'reset', hover, 'tap']
        )
        taptool = plot.select(type=TapTool)
        taptool.callback = OpenURL(url='@jira_url')

        plot.vbar(source=source, x='x_values', top='y_values', bottom=0, width=0.3, color='blue')
        return plot

    def chart_remaining_days(self, stats_data):
        self.log.info('Generating graph about estimated remaining days')
        plot_values = []
        for scan_day in stats_data:
            for rol_avg in stats_data[scan_day]['days_to_completion']:
                if rol_avg == 'current':
                    col_txt = 'This Week'
                elif rol_avg == 'all':
                    col_txt = 'All Time'
                else:
                    col_txt = str(rol_avg) + ' Weeks'
                plot_values.append([
                    col_txt
                    , stats_data[scan_day]['days_to_completion'][rol_avg]
                ])
            break
        dat = pd.DataFrame(plot_values, columns=['entity', 'value'])
        source = ColumnDataSource(dict(
            x_values=dat.entity
            , y_values=dat.value
        ))
        # Declare tools
        hover = HoverTool(
            tooltips=[
                ('Estimated based on:', '@x_values'),
                ('Days to completion:', '@y_values')
            ]
        )
        plot = figure(
            plot_width=600
            , plot_height=300
            , x_axis_label='Estimations calculated based on'
            , y_axis_label='Remaining days'
            , title='Estimated days to completion'
            , x_range=FactorRange(factors=list(dat.entity))
            , tools=['save', 'pan', 'box_zoom', 'reset', hover]
        )
        plot.vbar(source=source, x='x_values', top='y_values', bottom=0, width=0.3, color='red')
        return plot

    def main(self, stats_days, stats_weeks, stats_remaining):
        days_chart = self.build_velocity_days(stats_days)
        weeks_chart = self.build_velocity_weeks(stats_weeks)

        remaining_types = self.chart_remaining_types(stats_remaining)
        remaining_assignees = self.chart_remaining_assignees(stats_remaining)
        remaining_days = self.chart_remaining_days(stats_remaining)

        bokeh_layout = layout([
            [days_chart]
            , [weeks_chart]
            , [remaining_types, remaining_assignees, remaining_days]
        ], sizing_mode='stretch_both')

        # output to static HTML file
        output_file(self.config.filepath_charts + 'index.html',
                    title='[' + self.time.get_current_date().strftime(
                        "%Y-%m-%d") + '] - Jira Metrics, built on: ' + self.time.get_current_date().strftime(
                        "%Y-%m-%d"))
        save(bokeh_layout)
        show(bokeh_layout)
