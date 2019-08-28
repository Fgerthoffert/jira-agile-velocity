import React, { Component } from "react"; // let's also import Component
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Chart from "chart.js";

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

  componentDidMount() {
    this.buildChart();
  }

  componentDidUpdate() {
    this.buildChart();
  }

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
      const chartData = activePoints[0]["_chart"].config.data;
      const idx = activePoints[0]["_index"];
      const issues = velocity.weeks[idx].completion.list;
      if (issues.length > 0) {
        const keys = issues.map((i: any) => i.key);
        console.log(keys);
        console.log(keys.toString());
        const url =
          issues[0].host + "/issues/?jql=key in (" + keys.toString() + ")";
        console.log(url);
        window.open(url, "_blank");
      }
      //      console.log(issues);
    }
  };

  // render will know everything!
  render() {
    console.log(this.chartRef);

    //    return <p>The current time is {this.state.time.toLocaleTimeString()}</p>;
    return (
      <div>
        <canvas id="myChart" ref={this.chartRef} />
      </div>
    );
  }
}

export default VelocityChart;
