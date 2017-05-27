import numpy
import collections

class Crunch(object):
    ''' 
        tbc
    '''

    def __init__(self, log, config, time):
        self.log = log
        self.config = config
        self.time = time

    """
    For the current week, return an array containing
     - Each day total completed story points
     - Current daily average or completed story points for the week
    """
    def getCurrentWeek(self, daily_data):
        work_data = {}
        work_data["total"] = 0
        avg = []
        current_week = self.time.getCurrentDate().strftime("%Y.%W")
        for current_day_data in daily_data:
            if daily_data[current_day_data]["datetime"].strftime("%Y.%W") == current_week:
                current_day_name = daily_data[current_day_data]["datetime"].strftime("%A")
                work_data[current_day_name] = int(daily_data[current_day_data]["points"])
                avg.append(daily_data[current_day_data]["points"])
                work_data["total"] = work_data["total"] + daily_data[current_day_data]["points"]

        work_data["average"] = int(numpy.mean(avg))
        if "Monday" not in work_data:
            work_data["Monday"] = None
        if "Tuesday" not in work_data:
            work_data["Tuesday"] = None
        if "Wednesday" not in work_data:
            work_data["Wednesday"] = None
        if "Thursday" not in work_data:
            work_data["Thursday"] = None
        if "Friday" not in work_data:
            work_data["Friday"] = None

        return work_data

    """
    For each day, going back over a pre-configured number of weeks, calculate daily average
    """
    def getDailyAverageWeek(self, daily_data):
        work_data = {}
        history_weeks = self.config.getConfig('history_weeks')
        history_days = int(history_weeks) * 7
        for current_day_data in daily_data:
            time_delta = self.time.getCurrentDate() - daily_data[current_day_data]["datetime"]
            if time_delta.days <= history_days:
                current_day_name = daily_data[current_day_data]["datetime"].strftime("%A")

                if current_day_name not in work_data:
                    work_data[current_day_name] = {}
                    work_data[current_day_name]["values"] = []
                    work_data[current_day_name]["avg"] = None
                    work_data[current_day_name]["max"] = None
                    work_data[current_day_name]["min"] = None

                if work_data[current_day_name]["max"] == None or daily_data[current_day_data]["points"] > max(work_data[current_day_name]["values"]):
                    work_data[current_day_name]["max"] = {}
                    work_data[current_day_name]["max"]["datetime"] = daily_data[current_day_data]["datetime"]
                    work_data[current_day_name]["max"]["value"] = int(daily_data[current_day_data]["points"])

                if work_data[current_day_name]["min"] == None or daily_data[current_day_data]["points"] < min(work_data[current_day_name]["values"]):
                    work_data[current_day_name]["min"] = {}
                    work_data[current_day_name]["min"]["datetime"] = daily_data[current_day_data]["datetime"]
                    work_data[current_day_name]["min"]["value"] = int(daily_data[current_day_data]["points"])

                work_data[current_day_name]["values"].append(daily_data[current_day_data]["points"])
                work_data[current_day_name]["avg"] = int(numpy.mean(work_data[current_day_name]["values"]))
        return work_data

    """
    For each day, going back over a pre-configured number of weeks, calculate daily average
    """
    def getWeeklyData(self, daily_data):
        work_data = collections.OrderedDict()
        history_weeks = self.config.getConfig('history_weeks')
        history_days = int(history_weeks) * 7
        today_week_name = self.time.getCurrentDate().strftime("%Y.W%W")

        for current_day_data in daily_data:
            time_delta = self.time.getCurrentDate() - daily_data[current_day_data]["datetime"]
            if time_delta.days <= history_days:
                current_week_name = daily_data[current_day_data]["datetime"].strftime("%Y.W%W")
                if today_week_name != current_week_name:
                    if current_week_name not in work_data:
                        work_data[current_week_name] = {}
                        work_data[current_week_name]["values"] = []
                        work_data[current_week_name]["sum"] = 0
                        work_data[current_week_name]["avg"] = None

                    work_data[current_week_name]["values"].append(daily_data[current_day_data]["points"])
                    work_data[current_week_name]["avg"] = int(numpy.mean(work_data[current_week_name]["values"]))
                    work_data[current_week_name]["sum"] = work_data[current_week_name]["sum"] + daily_data[current_day_data]["points"]

        # Get smallest and biggest week
        work_data["period"] = {}
        work_data["period"]["max"] = None
        work_data["period"]["min"] = None
        for week_idx in work_data:
            if "sum" in work_data[week_idx] and (work_data["period"]["max"] == None or work_data["period"]["max"] < work_data[week_idx]["sum"]):
                work_data["period"]["max"] = work_data[week_idx]["sum"]
            if "sum" in work_data[week_idx] and (work_data["period"]["min"] == None or work_data["period"]["min"] > work_data[week_idx]["sum"]):
                work_data["period"]["min"] = work_data[week_idx]["sum"]

        return work_data