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

class HistoryFocusChart extends Component<any, any> {
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
            label: 'Selected Initiative',
            data: dataset.map((w: any) => w.initiativeCompletion[metric].focus),
            backgroundColor: 'rgb(54, 162, 235)',
            borderColor: 'rgb(54, 162, 235)',
            type: 'line',
            fill: true,
            pointRadius: 5,
          },
          {
            label: 'Other Initiatives',
            data: dataset.map(
              (w: any) => w.otherInitiativesCompletion[metric].focus,
            ),
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            type: 'line',
            fill: true,
            pointRadius: 5,
          },
          {
            label: 'Non Initiatives',
            data: dataset.map((w: any) => {
              const nonInitiatives =
                100 -
                w.initiativeCompletion[metric].focus -
                w.otherInitiativesCompletion[metric].focus;
              if (nonInitiatives > 0) {
                return nonInitiatives;
              }
              return 0;
            }),
            backgroundColor: 'rgb(201, 203, 207)',
            borderColor: 'rgb(201, 203, 207)',
            type: 'line',
            fill: true,
            pointRadius: 5,
          },
        ],
        labels: dataset.map((w: any) => getDayWeek(w.weekEnd)),
      },
      options: {
        onClick: this.clickChart,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
              stacked: true,
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

  // https://jsfiddle.net/u1szh96g/208/
  // I couldn't find a way with chartJS to identify which area was clicked
  // Adding a fake label to the JQL query to quickly identify which tickets are outside or insite the initiative
  clickChart = (event: any) => {
    const { dataset, jiraHost, defaultPoints } = this.props;
    let metric = 'points';
    if (!defaultPoints) {
      metric = 'issues';
    }
    const activePoints = this.chart.getElementsAtEvent(event);
    if (activePoints[0] !== undefined) {
      const idx = activePoints[0]._index;
      const clickedValue = this.chart.data.datasets[
        activePoints[0]._datasetIndex
      ].data[activePoints[0]._index];
      const dateClicked = dataset[idx];
      const issues = dataset[idx].teamCompletion.list;
      if (issues.length > 0 && this.allowClick === true) {
        const filteredTeamCompleted = dataset[idx].teamCompletion.list.filter(
          (i: string) =>
            dataset[idx].initiativeCompletion.list.find(
              (ic: string) => i === ic,
            ) === undefined &&
            dataset[idx].otherInitiativesCompletion.list.find(
              (ic: string) => i === ic,
            ) === undefined,
        );
        this.allowClick = false;
        let baseQuery = jiraHost + '/issues/?jql=';
        let modified = false;
        if (dataset[idx].initiativeCompletion.list.length) {
          modified = true;
          baseQuery =
            baseQuery +
            '(key in (' +
            dataset[idx].initiativeCompletion.list.toString() +
            ') OR labels = "Inside-Initiative")';
        }
        if (dataset[idx].otherInitiativesCompletion.list.length) {
          if (modified === true) {
            baseQuery = baseQuery + ' OR ';
          }
          baseQuery =
            baseQuery +
            '(key in (' +
            dataset[idx].otherInitiativesCompletion.list.toString() +
            ') OR labels = "Outside-Initiative")';
        }
        if (filteredTeamCompleted.length) {
          if (modified === true) {
            baseQuery = baseQuery + ' OR ';
          }
          baseQuery =
            baseQuery +
            '(key in (' +
            filteredTeamCompleted.toString() +
            ') OR labels = "Non-Initiative")';
        }
        /*
        const url =
          jiraHost +
          '/issues/?jql=(key in (' +
          filteredTeamCompleted.toString() +
          ') OR labels = "Outside-Initiative") OR (key in (' +
          dataset[idx].initiativeCompletion.list.toString() +
		  ') OR labels = "Inside-Initiative")';
		  */
        window.open(baseQuery, '_blank');
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
        <canvas id="HistoryFocusChart" ref={this.chartRef} />
      </div>
    );
  }
}

export default withStyles(styles)(HistoryFocusChart);
