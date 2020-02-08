import React, { Component } from 'react'; // let's also import Component
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import { ResponsiveHeatMap } from '@nivo/heatmap';

import moment from 'moment';

import RoadmapTooltip from './RoadmapTooltip/index';

import { getInitiativeTitle, getNonInitiativeTitle, getCellDataInitiatives, getCompletionColor } from './utils';

const styles = (theme: Theme) =>
	createStyles({
		root: {
			height: 800
		}
	});

interface IDataset {
	label: string;
	backgroundColor: string;
	completed: number[];
	data: number[];
}
interface IDatasetObj {
	[key: string]: any;
}

interface ICompletionObj {
	[key: string]: any;
}

class RoadmapCompletionChart extends Component<any, any> {
	completionWeeks: any = {};
	dataset: any = {};

	getTooltip = (data: any) => {
		const { roadmap, defaultPoints } = this.props;
		return (
			<RoadmapTooltip
				data={data}
				roadmap={roadmap}
				completionWeeks={this.completionWeeks}
				defaultPoints={defaultPoints}
			/>
		);
	};

	getDayWeek = (week: string) => {
		const data = week.split('.');
		const date = moment().isoWeekYear(parseInt(data[0], 10)).isoWeek(parseInt(data[1], 10)).endOf('week');
		return date.format('MMM Do');
	};

	cellClick = (initiative: string, weekTxt: string) => {
		const { roadmap } = this.props;
		const cellDataInitiatives = getCellDataInitiatives(initiative, weekTxt, roadmap);
		const keys = cellDataInitiatives.map((i: any) => i.key);
		const url = roadmap.host + '/issues/?jql=key in (' + keys.toString() + ')';
		window.open(url, '_blank');
	};

	clickLegend = (key: string) => {
		const { roadmap } = this.props;
		const initiative = roadmap.initiatives.find((i: any) => getInitiativeTitle(i) === key);
		if (initiative !== undefined) {
			const url = roadmap.host + '/browse/' + initiative.key;
			window.open(url, '_blank');
		}
	};

	buildDataset = () => {
		const { roadmap, defaultPoints } = this.props;
		let metric = 'points';
		if (!defaultPoints) {
			metric = 'issues';
		}

		const dataset: IDatasetObj[] = [];
		for (const initiative of roadmap.initiatives.filter(
			// Filter down to display only initiatives with issues completed over the displayed weeks
			(i: any) =>
				i.weeks.map((w: any) => w[metric].count).reduce((acc: number, count: number) => acc + count, 0) > 0
		)) {
			const initiativeData: IDatasetObj = {
				initiative: getInitiativeTitle(initiative)
			};
			for (const week of initiative.weeks) {
				initiativeData[week.weekTxt] = week[metric].count;
			}
			dataset.push(initiativeData);
		}
		const nonInitiatives: any = {
			initiative: getNonInitiativeTitle()
		};
		for (const week of roadmap.orphanIssues) {
			// @ts-ignore
			nonInitiatives[week.weekTxt] = week[metric].count;
		}
		dataset.push(nonInitiatives);
		return dataset;
	};

	render() {
		const { roadmap, defaultPoints } = this.props;
		this.completionWeeks = {};
		let metric = 'points';
		if (!defaultPoints) {
			metric = 'issues';
		}
		const chartHeight = 50 + roadmap.initiatives.filter((i: any) => i.metrics[metric].completed > 0).length * 20;
		this.dataset = this.buildDataset();
		// @ts-ignore
		return (
			<div style={{ height: chartHeight }}>
				<ResponsiveHeatMap
					data={this.dataset}
					keys={roadmap.initiatives[0].weeks.map((w: any) => w.weekTxt)}
					indexBy='initiative'
					margin={{ top: 0, right: 30, bottom: 60, left: 300 }}
					forceSquare={false}
					axisTop={null}
					axisRight={null}
					cellBorderWidth={1}
					axisBottom={{
						orient: 'top',
						tickSize: 5,
						tickPadding: 5,
						tickRotation: -90,
						legend: '',
						legendOffset: 36,
						format: (v: any) => this.getDayWeek(v)
					}}
					axisLeft={{
						orient: 'middle',
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						legend: '',
						legendPosition: 'middle',
						legendOffset: -40,
						onClick: (event: any, key: string) => {
							this.clickLegend(key);
						}
					}}
					cellOpacity={1}
					cellBorderColor={'#a4a3a5'}
					labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.8 ] ] }}
					tooltip={this.getTooltip}
					cellShape={({
						data,
						value,
						x,
						y,
						width,
						height,
						color,
						opacity,
						borderWidth,
						borderColor,
						enableLabel,
						textColor,
						onHover,
						onLeave,
						onClick,
						theme
					}: any) => {
						if (value === 0) {
							return (
								<g transform={`translate(${x}, ${y})`} style={{ cursor: 'pointer' }}>
									<rect
										x={width * -0.5}
										y={height * -0.5}
										width={width}
										height={height}
										fill={''}
										fillOpacity={0}
										strokeWidth={borderWidth}
										stroke={borderColor}
										strokeOpacity={opacity}
									/>
								</g>
							);
						}
						return (
							<g
								transform={`translate(${x}, ${y})`}
								onMouseEnter={onHover}
								onMouseMove={onHover}
								onMouseLeave={onLeave}
								onClick={(e) => {
									this.cellClick(data.yKey, data.xKey);
								}}
								style={{ cursor: 'pointer' }}
							>
								<rect
									x={width * -0.5}
									y={height * -0.5}
									width={width}
									height={height}
									fill={getCompletionColor(data, value, this.dataset)}
									fillOpacity={opacity}
									strokeWidth={borderWidth}
									stroke={borderColor}
									strokeOpacity={opacity}
								/>
								{enableLabel && (
									<text
										dominantBaseline='central'
										textAnchor='middle'
										style={{
											...theme.labels.text,
											fill: textColor
										}}
										fillOpacity={opacity}
									>
										{value}
									</text>
								)}
							</g>
						);
					}}
					animate={false}
					motionStiffness={80}
					motionDamping={9}
					hoverTarget='rowColumn'
					cellHoverOthersOpacity={0.1}
				/>
			</div>
		);
	}
}

export default withStyles(styles)(RoadmapCompletionChart);
