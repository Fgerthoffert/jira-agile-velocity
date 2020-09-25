import React, { Component } from 'react'; // let's also import Component
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import toMaterialStyle from 'material-color-hash';

import moment from 'moment';

import { getInitiativeTitle } from './utils';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      height: 800,
    },
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

class RoadmapFutureChart extends Component<any, any> {
  completionWeeks: any = {};

  /* 
    Display different background colors based on the percentage of the effort spent on a particular activity for a week
  */
  getCompletionColor = (data: any, value: any) => {
    const { roadmap } = this.props;
    const initiative = roadmap.futureCompletion.find(
      (i: any) => getInitiativeTitle(i) === data.yKey,
    );
    if (initiative !== undefined) {
      return toMaterialStyle(initiative.team.team, 200).backgroundColor;
    }
    return 'rgb(65, 171, 93)';
  };

  formatWeekEnd = (weekEnd: string) => {
    const date = moment(weekEnd);
    return date.format('MMM Do');
  };

  clickLegend = (key: string) => {
    const { roadmap } = this.props;
    const initiative = roadmap.initiatives.find(
      (i: any) => getInitiativeTitle(i) === key,
    );
    if (initiative !== undefined) {
      const url = roadmap.host + '/browse/' + initiative.key;
      window.open(url, '_blank');
    }
  };

  cellClick = (initiative: string, weekEnd: string) => {
    const { roadmap } = this.props;
    const cellData = roadmap.futureCompletion
      .find((i: any) => getInitiativeTitle(i) === initiative)
      .weeks.find((w: any) => w.weekEnd === weekEnd).list;
    if (cellData.length > 0) {
      const keys = cellData.map((i: any) => i.key);
      const url =
        roadmap.host + '/issues/?jql=key in (' + keys.toString() + ')';
      window.open(url, '_blank');
    }
  };

  buildDataset = (initiatives: any) => {
    const { defaultPoints } = this.props;
    let metric = 'points';
    if (!defaultPoints) {
      metric = 'issues';
    }

    const dataset: IDatasetObj[] = [];
    for (const initiative of initiatives) {
      const initiativeData: IDatasetObj = {
        initiative: getInitiativeTitle(initiative),
      };
      for (const week of initiative.weeks) {
        initiativeData[week.weekEnd] = week[metric].count === 0 ? week[metric].count : week[metric].count.toFixed(2);
      }
      dataset.push(initiativeData);
    }
    return dataset;
  };

  render() {
    const { roadmap, defaultPoints } = this.props;
    let metric = 'points';
    if (!defaultPoints) {
      metric = 'issues';
    }
    //console.log(roadmap.futureCompletion);
    const initiatives = roadmap.futureCompletion.filter(
      (i: any) => i.metrics[metric].remaining > 0,
    );
    this.completionWeeks = {};
    // 100 minimal height to accomodate enought space for the legend
    const chartHeight = 50 + initiatives.length * 25;
    return (
      <div style={{ height: chartHeight }}>
        <ResponsiveHeatMap
          data={this.buildDataset(initiatives)}
          keys={initiatives[0].weeks.map((w: any) => w.weekEnd)}
          indexBy="initiative"
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
            format: (weekEnd: string) => this.formatWeekEnd(weekEnd),
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
            },
          }}
          cellOpacity={1}
          cellBorderColor={'#a4a3a5'}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
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
            theme,
          }: any) => {
            if (value === 0) {
              return (
                <g
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: 'pointer' }}
                >
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
                onClick={e => {
                  this.cellClick(data.yKey, data.xKey);
                }}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={width * -0.5}
                  y={height * -0.5}
                  width={width}
                  height={height}
                  fill={this.getCompletionColor(data, value)}
                  fillOpacity={opacity}
                  strokeWidth={borderWidth}
                  stroke={borderColor}
                  strokeOpacity={opacity}
                />
                {enableLabel && (
                  <text
                    dominantBaseline="central"
                    textAnchor="middle"
                    style={{
                      ...theme.labels.text,
                      fill: textColor,
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
          hoverTarget="row"
          cellHoverOthersOpacity={0.1}
        />
      </div>
    );
  }
}

export default withStyles(styles)(RoadmapFutureChart);
