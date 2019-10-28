import React, { Component } from 'react'; // let's also import Component
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import Chart from 'chart.js';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      // height: 400
    }
  });

class VelocityChart extends Component<any, any> {
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
          {
            label: 'Completed',
            backgroundColor: '#64b5f6',
            borderColor: '#64b5f6',
            borderWidth: 2,
            data: dataset.map((w: any) => w.completion[metric].count)
          }
        ],
        labels: dataset.map((w: any) => w.legend)
      },
      options: {
        onClick: this.clickChart,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        },
        tooltips: {
          position: 'nearest',
          mode: 'index',
          intersect: false
        },
        plugins: {
          datalabels: {
            display: false
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
        //        const keys = issues.map((i: any) => i.key);
        // const url =
        //  issues[0].host + '/issues/?jql=key in (' + keys.toString() + ')';
        const url =
          jiraHost +
          '/issues/?jql=' +
          jqlCompletion +
          ' ON(' +
          issues[0].closedAt +
          ')';
        window.open(url, '_blank');
        setTimeout(() => {
          this.resetAllowClick();
        }, 1000);
      }
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <canvas id='VelocityChart' ref={this.chartRef} />
      </div>
    );
  }
}

export default withStyles(styles)(VelocityChart);
