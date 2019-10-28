import React, { Component } from 'react'; // let's also import Component
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import Chart from 'chart.js';
import toMaterialStyle from 'material-color-hash';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      // height: 400
    }
  });

class VelocityChartStacked extends Component<any, any> {
  chartRef: any = React.createRef();
  chart: any = {};
  allowClick: boolean = true;

  componentDidMount() {
    this.buildChart();
  }

  componentDidUpdate() {
    this.buildChart();
  }

  resetAllowClick = () => {
    this.allowClick = true;
  };

  buildChart = () => {
    const { dataset, defaultPoints } = this.props;
    const myChartRef = this.chartRef.current.getContext('2d');
    let metric = 'points';
    if (!defaultPoints) {
      metric = 'issues';
    }

    if (this.chart.destroy !== undefined) {
      this.chart.destroy();
    }

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    const weekDays = [];
    // @ts-ignore
    for (const [idx, day] of days.entries()) {
      weekDays.push({
        label: day,
        // @ts-ignore
        ...toMaterialStyle('t', (idx + 1) * 100),
        //        backgroundColor: '#64b5f6',
        //        borderColor: '#64b5f6',
        borderWidth: 2,
        data: dataset.map(
          (w: any) =>
            w.weekDays.find((d: any) => d.weekdayTxt === day).completion[metric]
              .count
        )
      });
    }
    this.chart = new Chart(myChartRef, {
      type: 'bar',
      data: {
        datasets: [
          {
            label: 'Velocity (rolling average)',
            data: dataset.map((w: any) => w.completion[metric].velocity),
            backgroundColor: '#ef5350',
            fill: false,
            type: 'line'
          },
          ...weekDays
        ],
        labels: dataset.map((w: any) => w.legend)
      },
      options: {
        onClick: this.clickChart,
        plugins: {
          datalabels: {
            display: false
          }
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              },
              stacked: true
            }
          ],
          xAxes: [
            {
              stacked: true
            }
          ]
        },
        tooltips: {
          position: 'nearest',
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (tooltipItem: any, data: any) => {
              if (
                tooltipItem.datasetIndex === 0 ||
                parseInt(tooltipItem.value, 10) === 0
              ) {
                return (
                  data.datasets[tooltipItem.datasetIndex].label +
                  ': ' +
                  tooltipItem.value
                );
              }
              const currentWeek = dataset.find(
                (w: any) => w.weekTxt === tooltipItem.xLabel
              );
              const currentDay =
                currentWeek.weekDays[tooltipItem.datasetIndex - 1];
              return (
                currentDay.weekdayTxt +
                ' (' +
                currentDay.date.toJSON().slice(6, 10) +
                '): ' +
                tooltipItem.value
              );
            },
            title: (tooltipItems: any, data: any) => {
              //              console.log(tooltipItems);
              //              console.log(data);
              const currentWeek = dataset.find(
                (w: any) => w.weekTxt === tooltipItems[0].xLabel
              );
              return (
                currentWeek.weekTxt + ' week starting: ' + currentWeek.weekJira
              );
            }
          }
        }
      }
    });
  };

  // https://jsfiddle.net/u1szh96g/208/
  clickChart = (event: any) => {
    const { dataset, jiraHost, jqlCompletion } = this.props;
    const activePoints = this.chart.getElementsAtEvent(event);
    if (activePoints[0] !== undefined) {
      const idx = activePoints[0]._index;
      const issues = dataset[idx].completion.list;
      if (issues.length > 0 && this.allowClick === true) {
        this.allowClick = false;
        const clickedWeek = dataset[idx];
        let jqlString = '';
        const activeWeeks = clickedWeek.weekDays.filter(
          (d: any) => d.list.length > 0
        );
        for (const [widx, day] of activeWeeks.entries()) {
          jqlString =
            jqlString +
            ' (' +
            jqlCompletion +
            ' ON(' +
            day.list[0].closedAt +
            '))';
          if (widx < activeWeeks.length - 1) {
            jqlString = jqlString + ' OR';
          }
        }
        const url = jiraHost + '/issues/?jql=' + jqlString;
        window.open(url, '_blank');
        setTimeout(() => {
          this.resetAllowClick();
        }, 1000);
      }
      //      const issues = dataset[idx].completion.list;
      //      console.log(issues);
      /*
      if (issues.length > 0 && this.allowClick === true) {
        this.allowClick = false;
        const keys = issues.map((i: any) => i.key);
        //const url =
        //  issues[0].host + '/issues/?jql=key in (' + keys.toString() + ')';
        const url = issues[0].host + '/issues/?jql=' + issues[0].jql;
        window.open(url, '_blank');
        setTimeout(() => {
          this.resetAllowClick();
        }, 1000);
      }
      */
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <canvas id='VelocityChartStacked' ref={this.chartRef} />
      </div>
    );
  }
}

export default withStyles(styles)(VelocityChartStacked);
