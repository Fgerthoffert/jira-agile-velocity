// tslint:disable-next-line: file-name-casing
/*
    This function calculates and insert a health-related data to the object
*/
const insertHealth = (calendar: any) => {
  const updatedCalendar = JSON.parse(JSON.stringify(calendar));
  let lastDay = false;
  let lastWeek = false;
  let referenceDay = null;
  const health: any = {
    days: {
      velocity: {
        issues: {
          trend: 'DOWN',
          previous: 0,
          current: 0
        },
        points: {
          trend: 'DOWN',
          previous: 0,
          current: 0
        }
      },
      completion: {
        msgTxt: null,
        msgJira: null,
        issues: {
          list: [],
          count: 0,
          min: 0,
          max: 0,
          avg: 0
        },
        points: {
          list: [],
          count: 0,
          min: 0,
          max: 0,
          avg: 0
        }
      }
    },
    weeks: {
      velocity: {
        issues: {
          trend: 'DOWN',
          previous: 0,
          current: 0
        },
        points: {
          trend: 'DOWN',
          previous: 0,
          current: 0
        }
      },
      completion: {
        msgTxt: null,
        msgJira: null,
        issues: {
          list: [],
          count: 0,
          min: 0,
          max: 0,
          avg: 0
        },
        points: {
          list: [],
          count: 0,
          min: 0,
          max: 0,
          avg: 0
        }
      }
    }
  };
  for (let i = updatedCalendar.days.length - 1; i >= 0; i--) {
    // We don't look for Saturday or Sunday in those metrics, as it is less relevant to report on work those days
    if (
      updatedCalendar.days[i].weekDay !== 0 &&
      updatedCalendar.days[i].weekDay !== 6 &&
      lastDay === false
    ) {
      referenceDay = updatedCalendar.days[i].weekDay;
      health.days.completion.msgTxt = updatedCalendar.days[i].weekDayTxt;
      health.days.completion.msgJira = updatedCalendar.days[i].weekDayJira;

      for (const type of ['issues', 'points']) {
        health.days.velocity[type].current =
          updatedCalendar.days[i].completion[type].velocity;
        health.days.velocity[type].previous =
          updatedCalendar.days[i - 1].completion[type].velocity;
        if (
          updatedCalendar.days[i].completion[type].velocity >
          updatedCalendar.days[i - 1].completion[type].velocity
        ) {
          health.days.velocity[type].trend = 'UP';
        } else if (
          updatedCalendar.days[i].completion[type].velocity ===
          updatedCalendar.days[i - 1].completion[type].velocity
        ) {
          health.days.velocity[type].trend = 'FLAT';
        }
        health.days.completion[type].count =
          updatedCalendar.days[i].completion[type].count;
      }
      lastDay = true;
    }
    if (referenceDay === updatedCalendar.days[i].weekDay) {
      health.days.completion.points.list.push(
        updatedCalendar.days[i].completion.points.count
      );
      health.days.completion.issues.list.push(
        updatedCalendar.days[i].completion.issues.count
      );
    }
  }

  //Once done going through the loop, generate min/max/avg
  for (const type of ['issues', 'points']) {
    health.days.completion[type].min = Math.min(
      ...health.days.completion[type].list
    );
    health.days.completion[type].max = Math.max(
      ...health.days.completion[type].list
    );
    health.days.completion[type].avg =
      Math.round(
        (health.days.completion[type].list.reduce(
          (a: number, b: number) => a + b,
          0
        ) /
          health.days.completion[type].list.length) *
          100
      ) / 100;
  }

  for (let i = updatedCalendar.weeks.length - 1; i >= 0; i--) {
    if (lastWeek === false) {
      health.weeks.completion.msgTxt = updatedCalendar.weeks[i].weekTxt;
      health.weeks.completion.msgJira = updatedCalendar.weeks[i].weekJira;

      for (const type of ['issues', 'points']) {
        health.weeks.velocity[type].current =
          updatedCalendar.weeks[i].completion[type].velocity;
        health.weeks.velocity[type].previous =
          updatedCalendar.weeks[i - 1].completion[type].velocity;
        if (
          updatedCalendar.weeks[i].completion[type].velocity >
          updatedCalendar.weeks[i - 1].completion[type].velocity
        ) {
          health.weeks.velocity[type].trend = 'UP';
        } else if (
          updatedCalendar.weeks[i].completion[type].velocity ===
          updatedCalendar.weeks[i - 1].completion[type].velocity
        ) {
          health.weeks.velocity[type].trend = 'FLAT';
        }
        health.weeks.completion[type].count =
          updatedCalendar.weeks[i].completion[type].count;
      }
      lastWeek = true;
    }
    health.weeks.completion.points.list.push(
      updatedCalendar.weeks[i].completion.points.count
    );
    health.weeks.completion.issues.list.push(
      updatedCalendar.weeks[i].completion.issues.count
    );
  }

  //Once done going through the loop, generate min/max/avg
  for (const type of ['issues', 'points']) {
    health.weeks.completion[type].min = Math.min(
      ...health.weeks.completion[type].list
    );
    health.weeks.completion[type].max = Math.max(
      ...health.weeks.completion[type].list
    );
    health.weeks.completion[type].avg =
      Math.round(
        (health.weeks.completion[type].list.reduce(
          (a: number, b: number) => a + b,
          0
        ) /
          health.weeks.completion[type].list.length) *
          100
      ) / 100;
  }
  updatedCalendar.health = health;
  return updatedCalendar;
};

export default insertHealth;
