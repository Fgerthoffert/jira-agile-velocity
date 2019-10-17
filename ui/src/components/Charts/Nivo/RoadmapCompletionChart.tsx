import React, { Component } from 'react'; // let's also import Component
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import { ResponsiveHeatMap } from '@nivo/heatmap';

import RoadmapTooltip from './RoadmapTooltip/index';

import {
  getInitiativeTitle,
  getNonInitiativeTitle,
  getCellDataInitiatives,
  getCompletionColor
} from './utils';

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

  cellClick = (initiative: string, weekTxt: string) => {
    const { roadmap } = this.props;
    const cellDataInitiatives = getCellDataInitiatives(
      initiative,
      weekTxt,
      roadmap,
      this.completionWeeks
    );
    const keys = cellDataInitiatives.map((i: any) => i.key);
    const url =
      cellDataInitiatives[0].host +
      '/issues/?jql=key in (' +
      keys.toString() +
      ')';
    window.open(url, '_blank');
  };

  buildDataset = () => {
    const { roadmap, defaultPoints } = this.props;
    let metric = 'points';
    if (!defaultPoints) {
      metric = 'issues';
    }

    const dataset: IDatasetObj[] = [];
    for (const initiative of roadmap.byInitiative.filter(
      // Filter down to display only initiatives with issues completed over the displayed weeks
      (i: any) =>
        i.weeks
          .map((w: any) => w[metric].count)
          .reduce((acc: number, count: number) => acc + count, 0) > 0
    )) {
      const initiativeData: IDatasetObj = {
        initiative: getInitiativeTitle(initiative)
      };
      for (const week of initiative.weeks) {
        const teamCompletionWeek = roadmap.byTeam
          .find((t: any) => t.name === null)
          .weeks.find((w: any) => w.weekStart === week.weekStart);
        if (this.completionWeeks[week.weekTxt] === undefined) {
          // completionWeeks is used to store stats and data at a week level
          this.completionWeeks[week.weekTxt] = {
            weekStart: week.weekStart,
            weekTxt: week.weekTxt,
            totalList:
              metric === 'points'
                ? teamCompletionWeek.list.filter((i: any) => i.points > 0)
                : teamCompletionWeek.list,
            totalCount:
              teamCompletionWeek !== undefined
                ? teamCompletionWeek[metric].count
                : 0,
            initiativesList: [],
            initiativesCount: 0,
            // At first we push all issues as if those were not completed in an initiative
            nonInitiativesList:
              metric === 'points'
                ? teamCompletionWeek.list.filter((i: any) => i.points > 0)
                : teamCompletionWeek.list,
            nonInitiativesCount:
              teamCompletionWeek !== undefined
                ? teamCompletionWeek[metric].count
                : 0
          };
        }
        this.completionWeeks[week.weekTxt].initiativesCount =
          this.completionWeeks[week.weekTxt].initiativesCount +
          week[metric].count;
        this.completionWeeks[week.weekTxt].nonInitiativesCount =
          this.completionWeeks[week.weekTxt].totalCount -
          this.completionWeeks[week.weekTxt].initiativesCount;
        initiativeData[week.weekTxt] = week[metric].count;
        if (week.list.length > 0) {
          if (metric === 'points') {
            this.completionWeeks[week.weekTxt].initiativesList = [
              ...this.completionWeeks[week.weekTxt].initiativesList,
              ...week.list.filter((i: any) => i.points > 0)
            ];
          } else {
            this.completionWeeks[week.weekTxt].initiativesList = [
              ...this.completionWeeks[week.weekTxt].initiativesList,
              ...week.list
            ];
          }
          // We progressively purge the nonInitiatives from actual initiatives completion
          this.completionWeeks[
            week.weekTxt
          ].nonInitiativesList = this.completionWeeks[
            week.weekTxt
          ].nonInitiativesList.filter((i: any) => {
            for (const initiativeWeek of week.list) {
              if (initiativeWeek.key === i.key) {
                return false;
              }
            }
            return true;
          });
        }
      }
      dataset.push(initiativeData);
    }
    const nonInitiatives: any = {
      initiative: getNonInitiativeTitle()
    };
    for (const week of Object.values(this.completionWeeks)) {
      // @ts-ignore
      nonInitiatives[week.weekTxt] = week.nonInitiativesCount;
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
    const chartHeight =
      50 +
      roadmap.byInitiative.filter((i: any) => i.metrics[metric].completed > 0)
        .length *
        20;
    this.dataset = this.buildDataset();
    // @ts-ignore
    return (
      <div style={{ height: chartHeight }}>
        // @ts-ignore
        <ResponsiveHeatMap
          data={this.dataset}
          keys={roadmap.byInitiative[0].weeks.map((w: any) => w.weekTxt)}
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
                  this.cellClick(data.yKey, data.xKey);
                }}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={width * -0.5}
                  y={height * -0.5}
                  width={width}
                  height={height}
                  fill={getCompletionColor(data, value, this.completionWeeks)}
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

export default withStyles(styles)(RoadmapCompletionChart);
