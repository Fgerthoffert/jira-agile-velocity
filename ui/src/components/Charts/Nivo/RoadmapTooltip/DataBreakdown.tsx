import React, { Component } from 'react'; // let's also import Component
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import Chart from 'chart.js';
import randomColor from 'randomcolor';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      // height: 200
    }
  });

class DataBreakdown extends Component<any, any> {
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
      type: 'pie',
      plugins: [ChartDataLabels],
      data: {
        datasets: [
          {
            data: dataset.map((value: any) => value[metric].count),
            backgroundColor: dataset.map((value: any) =>
              randomColor({ seed: value.name })
            )
          }
        ],
        labels: dataset.map((value: any) => value.name)
      },
      options: {
        responsive: true,
        legend: {
          position: 'left'
        },
        animation: {
          animateRotate: false
        },
        plugins: {
          datalabels: {
            display: true
          }
        }
      }
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <canvas id='DataBreakdown' ref={this.chartRef} height='200' />
      </div>
    );
  }
}

export default withStyles(styles)(DataBreakdown);
