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
    const { dataset } = this.props;
    const myChartRef = this.chartRef.current.getContext('2d');

    if (this.chart.destroy !== undefined) {
      this.chart.destroy();
    }

    this.chart = new Chart(myChartRef, {
      type: 'bar',
      data: {
        datasets: [
          {
            label: 'current',
            data: dataset.map((w: any) => w.openedForAvg.value),
            backgroundColor: '#ffbdbc',
            borderColor: '#ffbdbc',
            fill: false,
            lineTension: 0,
            type: 'line',
          },
          {
            label: 'rolling',
            data: dataset.map((w: any) => w.openedForRolling.value),
            backgroundColor: '#a69aff',
            borderColor: '#a69aff',
            fill: false,
            type: 'line',
          },
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
              id: 'left',
              ticks: {
                beginAtZero: true
              },
              stacked: false,
              position: 'left'
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
              return (
                data.datasets[tooltipItem.datasetIndex].label +
                ': ' +
                tooltipItem.value + ' days'
              );
            },
            title: (tooltipItems: any, data: any) => {
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
      if (this.allowClick === true) {
        this.allowClick = false;
        const clickedWeek = dataset[idx];
        let jqlString = '';
        const activeWeeks = clickedWeek.weekDays.filter(
          (d: any) => d.completion.issues.count > 0
        );
        for (const [widx, day] of activeWeeks.entries()) {
          jqlString =
            jqlString +
            ' (' +
            jqlCompletion +
            ' ON(' +
            day.weekDayJira +
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
