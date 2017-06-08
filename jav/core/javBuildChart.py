import numpy as np
from bokeh.charts import Bar, output_file, show
from bokeh.layouts import layout
from bokeh.plotting import figure


class BuildChart(object):
    def __init__(self, log, config):
        self.log = log
        self.config = config

    def build_velocity_days(self, stats_data):
        self.log.info('Generating graph about daily effort')

        # Velocity Days
        x_dates = []
        y_points = []
        y_avg = []
        for scan_day in stats_data:
            x_dates.append(stats_data[scan_day]['datetime'])
            y_points.append(stats_data[scan_day]['points'])
            week_idx = '4'
            if week_idx not in stats_data[scan_day]['anyday']:
                week_idx = 4
            if 'avg' in stats_data[scan_day]['anyday'][week_idx]:
                y_avg.append(stats_data[scan_day]['anyday'][week_idx]['avg'])
            else:
                y_avg.append(0)

        # prepare some data
        data_dates = np.array(x_dates, dtype=np.datetime64)

        # create a new plot with a a datetime axis type
        p = figure(width=1000, height=350, x_axis_type='datetime', tools='save,pan,box_zoom,reset')

        # add renderers
        p.circle(data_dates, y_points, size=4, color='red', alpha=0.4, legend='Story Points')
        p.line(data_dates, y_avg, color='blue', legend='4 Weeks Average')

        # NEW: customize by setting attributes
        p.title.text = 'Daily Velocity'
        p.legend.location = 'top_left'
        p.grid.grid_line_alpha = 0
        p.xaxis.axis_label = 'Days (Monday-Friday)'
        p.yaxis.axis_label = 'Story Points'
        p.ygrid.band_fill_color = 'olive'
        p.ygrid.band_fill_alpha = 0.1

        return p

    def build_velocity_weeks(self, stats_data):
        self.log.info('Generating graph about weekly effort')

        # Velocity Days
        x_dates = []
        y_points = []
        y_avg = []
        y_weeks = []
        for scan_day in stats_data:
            x_dates.append(stats_data[scan_day]['datetime'])
            y_points.append(stats_data[scan_day]['points'])
            y_weeks.append(stats_data[scan_day]['weektxt'])

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

        # create a new plot with a a datetime axis type
        p = figure(width=1000, height=350, x_axis_type='datetime', tools='save,pan,box_zoom,reset')

        # add renderers
        p.circle(data_dates, y_points, size=4, color='red', alpha=0.4, legend='Story Points')
        p.line(data_dates, y_avg, color='blue', legend='4 Weeks Average')

        # NEW: customize by setting attributes
        p.title.text = 'Weekly Velocity'
        p.legend.location = 'top_left'
        p.grid.grid_line_alpha = 0
        p.xaxis.axis_label = 'Weeks'
        p.yaxis.axis_label = 'Story Points'
        p.ygrid.band_fill_color = 'olive'
        p.ygrid.band_fill_alpha = 0.1

        return p

    def build_remaining_types(self, stats_data):
        self.log.info('Generating graph about remaining effort per ticket type')

        plot_data = {}
        for scan_day in stats_data:
            plot_data['type'] = []
            plot_data['points'] = []
            total_points = stats_data[scan_day]['points']
            for assignee in stats_data[scan_day]['types']:
                plot_data['type'].append(stats_data[scan_day]['types'][assignee]['type'])
                plot_data['points'].append(stats_data[scan_day]['types'][assignee]['points'])
            break

        bar = Bar(
            plot_data
            , values='points'
            , label='type'
            , title='Remaining points per Ticket Type (Total: ' + str(total_points) + ')'
            , tools='save,pan,box_zoom,reset'
            , legend=None
            , color='green'

        )
        return bar

    def build_remaining_assignees(self, stats_data):
        self.log.info('Generating graph about remaining effort per assignee')

        plot_data = {}
        for scan_day in stats_data:
            total_points = stats_data[scan_day]['points']
            plot_data['assignee'] = []
            plot_data['points'] = []
            for assignee in stats_data[scan_day]['assignees']:
                plot_data['assignee'].append(stats_data[scan_day]['assignees'][assignee]['displayName'])
                plot_data['points'].append(stats_data[scan_day]['assignees'][assignee]['points'])
            break

        bar = Bar(
            plot_data
            , values='points'
            , label='assignee'
            , title='Remaining points per Jira Assignee (Total: ' + str(total_points) + ')'
            , tools='save,pan,box_zoom,reset'
            , legend=None
            , color='blue'

        )
        return bar

    def build_remaining_days(self, stats_data):
        self.log.info('Generating graph about estimated remaining days')
        plot_data = {}
        for scan_day in stats_data:
            plot_data['rolling_avg'] = []
            plot_data['days'] = []
            for rol_avg in stats_data[scan_day]['days_to_completion']:
                if rol_avg == 'current':
                    col_txt = 'This Week'
                elif rol_avg == 'all':
                    col_txt = 'All Time'
                else:
                    col_txt = str(rol_avg) + ' Weeks'
                plot_data['rolling_avg'].append(col_txt)
                plot_data['days'].append(stats_data[scan_day]['days_to_completion'][rol_avg])
            break

        bar = Bar(
            plot_data
            , values='days'
            , label='rolling_avg'
            , title='Estimated days to completion'
            , tools='save,pan,box_zoom,reset'
            , legend=None
            , color='red'
        )

        return bar

    def main(self, stats_days, stats_weeks, stats_remaining):
        days_chart = self.build_velocity_days(stats_days)
        weeks_chart = self.build_velocity_weeks(stats_weeks)

        remaining_types = self.build_remaining_types(stats_remaining)
        remaining_assignees = self.build_remaining_assignees(stats_remaining)
        remaining_days = self.build_remaining_days(stats_remaining)

        l = layout([
            [days_chart]
            , [weeks_chart]
            , [remaining_types, remaining_assignees, remaining_days]
        ], sizing_mode='stretch_both')

        # output to static HTML file
        output_file('lines.html', title='Weekly Completion')

        show(l)
