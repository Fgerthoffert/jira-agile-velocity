import React, { Component } from 'react'; // let's also import Component
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import toMaterialStyle from 'material-color-hash';

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

  cellClick = (initiative: string, weekTxt: string) => {
    const { roadmap } = this.props;
    const cellData = roadmap.futureCompletion
      .find((i: any) => getInitiativeTitle(i) === initiative)
      .weeks.find((w: any) => w.weekTxt === weekTxt).list;
    const keys = cellData.map((i: any) => i.key);
    const url = roadmap.host + '/issues/?jql=key in (' + keys.toString() + ')';
    window.open(url, '_blank');
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
        initiativeData[week.weekTxt] = week[metric].count;
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
          keys={initiatives[0].weeks.map((w: any) => w.weekTxt)}
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
          }}
          axisLeft={{
            orient: 'middle',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendPosition: 'middle',
            legendOffset: -40,
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
          hoverTarget="cell"
          cellHoverOthersOpacity={0.25}
        />
      </div>
    );
  }
}

export default withStyles(styles)(RoadmapFutureChart);
