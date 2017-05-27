import tabulate
import collections

class Tabulate(object):
    ''' 
        tbc
    '''

    def __init__(self, log, config):
        self.log = log
        self.config = config

    def getTrendDay(self, current_week_data, days_data, current_day):
        if current_week_data[current_day] == None:
            return 'N/A'
        elif current_week_data[current_day] > days_data[current_day]['avg']:
            return 'UP'
            # return ':clap: :arrow_upper_right:'
        elif current_week_data[current_day] == days_data[current_day]['avg']:
            return 'EQ'
            # return ':ok_hand: :arrow_right:'
        elif current_week_data[current_day] < days_data[current_day]['avg']:
            return 'DOWN'
            # return ':bangbang: :arrow_lower_right:'

    def getFirstValue(self, data):
        for idx in data:
            return data[idx]

    def generateDays(self, current_week_data, days_data, weeks_data):
        tab_headers = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Week Total']
        tab_content = [
            ['This Week'
                , current_week_data['Monday']
                , current_week_data['Tuesday']
                , current_week_data['Wednesday']
                , current_week_data['Thursday']
                , current_week_data['Friday']
                , current_week_data['total']
             ]
            , ['Minimum Pts'
                , days_data['Monday']['min']['value']
                , days_data['Tuesday']['min']['value']
                , days_data['Wednesday']['min']['value']
                , days_data['Thursday']['min']['value']
                , days_data['Friday']['min']['value']
                , weeks_data['period']['min']
               ]
            , ['Average Pts'
                , days_data['Monday']['avg']
                , days_data['Tuesday']['avg']
                , days_data['Wednesday']['avg']
                , days_data['Thursday']['avg']
                , days_data['Friday']['avg']
                , str(days_data['Monday']['avg'] + days_data['Tuesday']['avg'] + days_data['Wednesday']['avg'] +
                      days_data['Thursday']['avg'] + days_data['Friday']['avg'])
               ]
            , ['Maximum Pts'
                , days_data['Monday']['max']['value']
                , days_data['Tuesday']['max']['value']
                , days_data['Wednesday']['max']['value']
                , days_data['Thursday']['max']['value']
                , days_data['Friday']['max']['value']
                , weeks_data['period']['max']
               ]
            , ['Trend'
                , self.getTrendDay(current_week_data, days_data, 'Monday')
                , self.getTrendDay(current_week_data, days_data, 'Tuesday')
                , self.getTrendDay(current_week_data, days_data, 'Wednesday')
                , self.getTrendDay(current_week_data, days_data, 'Thursday')
                , self.getTrendDay(current_week_data, days_data, 'Friday')
               ]
        ]
        return tabulate.tabulate(tab_content, headers=tab_headers, tablefmt='fancy_grid')

    def generateWeeks(self, current_week_data, weeks_data):
        tab_headers = ['']
        tab_content = [['Total'], ['Daily. Avg']]
        for item in list(weeks_data.items())[::-1]:
            if 'values' in item[1] and len(item[1]['values']) == 5:
                tab_headers.append(item[0])
                tab_content[0].append(item[1]['sum'])
                tab_content[1].append(item[1]['avg'])

        tab_headers.append('Current')
        tab_content[0].append(current_week_data['total'])
        tab_content[1].append(current_week_data['average'])

        return tabulate.tabulate(tab_content, headers=tab_headers, tablefmt='fancy_grid')

    def generateRemaining(self, remaining_work, current_week_data, weeks_data):
        tab_headers = ['', 'All Time', 'Last Week', 'This Week']
        tab_content = [
            ['Points / Day'
                , remaining_work['average_daily_points']
                , self.getFirstValue(weeks_data)['avg']
                , current_week_data['average']
             ]
            , ['Days to Completion'
                , remaining_work['effort_days']
                , round(remaining_work['points'] / self.getFirstValue(weeks_data)['avg'], 1)
                , round(remaining_work['points'] / current_week_data['average'], 1)
            ]
        ]
        return tabulate.tabulate(tab_content, headers=tab_headers, tablefmt='fancy_grid')