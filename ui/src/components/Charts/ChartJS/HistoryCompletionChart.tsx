import React, { Component } from 'react'; // let's also import Component
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import Chart from 'chart.js';
import moment from 'moment';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      // height: 400
    },
  });

const getDayWeek = (sourceDate: string) => {
  const date = moment(sourceDate);
  return date.format('MMM Do');
};

class HistoryCompletionChart extends Component<any, any> {
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
            label: 'Total',
            data: dataset
              .filter((w: any) => w.history !== null)
              .map((w: any) => w.history.metrics[metric].total),
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            type: 'line',
            fill: false,
          },
          {
            label: 'Completed',
            data: dataset
              .filter((w: any) => w.history !== null)
              .map((w: any) => w.history.metrics[metric].completed),
            backgroundColor: 'rgb(54, 162, 235)',
            borderColor: 'rgb(54, 162, 235)',
            type: 'line',
            fill: false,
          },
          {
            label: 'Remaining',
            data: dataset
              .filter((w: any) => w.history !== null)
              .map((w: any) => w.history.metrics[metric].remaining),
            backgroundColor: 'rgb(75, 192, 192)',
            borderColor: 'rgb(75, 192, 192)',
            type: 'line',
            fill: false,
          },
        ],
        labels: dataset
          .filter((w: any) => w.history !== null)
          .map((w: any) => getDayWeek(w.weekEnd)),
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
        tooltips: {
          position: 'nearest',
          mode: 'index',
          intersect: false,
        },
        plugins: {
          datalabels: {
            display: false,
          },
        },
      },
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <canvas id="HistoryCompletionChart" ref={this.chartRef} />
      </div>
    );
  }
}

export default withStyles(styles)(HistoryCompletionChart);
