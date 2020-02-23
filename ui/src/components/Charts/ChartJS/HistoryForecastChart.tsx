import React, { Component } from 'react'; // let's also import Component
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import Chart from 'chart.js';

const styles = (theme: Theme) =>
	createStyles({
		root: {
			// height: 400
		}
	});

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
						label: 'Naive Completion',
						data: dataset.map((w: any) => w.eta.date[metric].weekNb),
						showLine: false,
						pointRadius: 5,
						pointHoverRadius: 5,
						backgroundColor: 'rgb(255, 99, 132)',
						borderColor: 'rgb(255, 99, 132)',
						type: 'line',
						fill: false
					}
				],
				labels: dataset.map((w: any) => w.date.slice(0, 10))
			},
			options: {
				scales: {
					yAxes: [
						{
							ticks: {
								suggestedMin: Math.min(...dataset.map((w: any) => w.eta.date[metric].weekNb)),
								suggestedMax: Math.max(...dataset.map((w: any) => w.eta.date[metric].weekNb)),
								stepSize: 1
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

	render() {
		const { classes } = this.props;
		return (
			<div className={classes.root}>
				<canvas id='HistoryForecastChart' ref={this.chartRef} />
			</div>
		);
	}
}

export default withStyles(styles)(HistoryForecastChart);
