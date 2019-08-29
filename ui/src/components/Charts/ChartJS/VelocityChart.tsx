import React, { Component } from "react"; // let's also import Component
import {
  makeStyles,
  Theme,
  createStyles,
  withStyles
} from "@material-ui/core/styles";
import Chart from "chart.js";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      //height: 400
    }
  });

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 300
    }
  })
);

class VelocityChart extends Component<any, any> {
  constructor(props: any) {
    super(props);
  }

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
    const { velocity, defaultPoints } = this.props;
    const myChartRef = this.chartRef.current.getContext("2d");
    let metric = "points";
    if (!defaultPoints) {
      metric = "issues";
    }

    console.log(velocity);

    this.chart = new Chart(myChartRef, {
      type: "bar",
      data: {
        datasets: [
          {
            label: "Weekly Velocity (4w. rolling average)",
            data: velocity.weeks.map((w: any) => w.completion[metric].velocity),
            backgroundColor: "#ef5350",
            fill: false,
            type: "line"
          },
          {
            label: "Weekly Completion",
            backgroundColor: "#64b5f6",
            borderColor: "#64b5f6",
            borderWidth: 2,
            data: velocity.weeks.map((w: any) => w.completion[metric].count)
          }
        ],
        labels: velocity.weeks.map((w: any) => w.weekTxt)
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
        }
      }
    });
  };

  //https://jsfiddle.net/u1szh96g/208/
  clickChart = (event: any) => {
    const { velocity } = this.props;
    const activePoints = this.chart.getElementsAtEvent(event);
    if (activePoints[0] !== undefined) {
      const idx = activePoints[0]["_index"];
      const issues = velocity.weeks[idx].completion.list;
      if (issues.length > 0 && this.allowClick === true) {
        this.allowClick = false;
        const keys = issues.map((i: any) => i.key);
        const url =
          issues[0].host + "/issues/?jql=key in (" + keys.toString() + ")";
        window.open(url, "_blank");
        setTimeout(() => {
          this.resetAllowClick();
        }, 1000);
      }
    }
  };

  render() {
    const { classes } = this.props;

    console.log(this.chartRef);
    //    return <p>The current time is {this.state.time.toLocaleTimeString()}</p>;
    return (
      <div className={classes.root}>
        <canvas id="myChart" ref={this.chartRef} />
      </div>
    );
  }
}

export default withStyles(styles)(VelocityChart);
