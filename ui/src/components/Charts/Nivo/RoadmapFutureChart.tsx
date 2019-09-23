import React, { Component } from 'react'; // let's also import Component
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import { ResponsiveHeatMap } from '@nivo/heatmap';

import { getInitiativeTitle } from './utils';

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

class RoadmapFutureChart extends Component<any, any> {
  completionWeeks: any = {};

  /* 
    Display different background colors based on the percentage of the effort spent on a particular activity for a week
  */
  getCompletionColor = (data: any, value: any) => {
    return 'rgb(65, 171, 93)';
  };

  buildDataset = () => {
    const { roadmap, defaultPoints } = this.props;
    let metric = 'points';
    if (!defaultPoints) {
      metric = 'issues';
    }

    const dataset: IDatasetObj[] = [];
    for (const initiative of roadmap.byFutureInitiative) {
      const initiativeData: IDatasetObj = {
        initiative: getInitiativeTitle(initiative)
      };
      for (const week of initiative.weeks) {
        initiativeData[week.weekTxt] = week[metric].count;
      }
      dataset.push(initiativeData);
    }
    return dataset;
  };

  render() {
    const { roadmap } = this.props;
    this.completionWeeks = {};
    // 100 minimal height to accomodate enought space for the legend
    const chartHeight = 50 + roadmap.byFutureInitiative.length * 25;
    // @ts-ignore
    return (
      <div style={{ height: chartHeight }}>
        <ResponsiveHeatMap
          data={this.buildDataset()}
          keys={roadmap.byFutureInitiative[0].weeks.map((w: any) => w.weekTxt)}
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
            legendOffset: 36
          }}
          axisLeft={{
            orient: 'middle',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendPosition: 'middle',
            legendOffset: -40
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
            theme
          }) => {
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
                  onClick(data, e);
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
          hoverTarget='cell'
          cellHoverOthersOpacity={0.25}
        />
      </div>
    );
  }
}

export default withStyles(styles)(RoadmapFutureChart);
