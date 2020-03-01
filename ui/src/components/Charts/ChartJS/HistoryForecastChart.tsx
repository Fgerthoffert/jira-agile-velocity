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

class HistoryForecastChart extends Component<any, any> {
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

    if (this.chart.destroy !== undefined) {
      this.chart.destroy();
    }
    this.chart = new Chart(myChartRef, {
      type: 'bar',
      data: {
        datasets: [
          {
            label: 'Potential naive completion',
            data: dataset.map((w: any) => new Date(w.history.forecast.weekEnd)),
            showLine: false,
            pointRadius: 5,
            pointHoverRadius: 5,
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            type: 'line',
            fill: false,
          },
        ],
        labels: dataset.map((w: any) =>  getDayWeek(w.weekEnd)),
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                callback: function(value: any) {
                  return getDayWeek(value)
                },
              },
            },
          ],
        },
        tooltips: {
          position: 'nearest',
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (tooltipItems: any) => {
              return 'Forecast on: ' + tooltipItems[0].xLabel
            },         
            label: (tooltipItem: any) => {
              return 'Naive completion: ' + new Date(parseInt(tooltipItem.value)).toISOString().slice(0, 10)
            },   
          }       
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
        <canvas id="HistoryForecastChart" ref={this.chartRef} />
      </div>
    );
  }
}

export default withStyles(styles)(HistoryForecastChart);
