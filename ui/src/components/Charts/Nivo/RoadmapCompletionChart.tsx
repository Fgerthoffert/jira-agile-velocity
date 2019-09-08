import React, { Component } from 'react'; // let's also import Component
import { Theme, createStyles, withStyles } from '@material-ui/core/styles';
import { ResponsiveHeatMap } from '@nivo/heatmap';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      height: 800
    }
  });

interface IDataset {
  label: string;
  backgroundColor: string;
  completed: Array<number>;
  data: Array<number>;
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

  /* 
    Display different background colors based on the percentage of the effort spent on a particular activity for a week
  */
  getCompletionColor = (data: any, value: any) => {
    const prct = Math.round(
      (value * 100) / this.completionWeeks[data.xKey].totalCount
    );
    if (prct < 20) {
      return 'rgb(247, 252, 185)';
    } else if (prct >= 20 && prct < 40) {
      return 'rgb(217, 240, 163)';
    } else if (prct >= 40 && prct < 60) {
      return 'rgb(173, 221, 142)';
    } else if (prct >= 60 && prct < 80) {
      return 'rgb(120, 198, 121)';
    }
    return 'rgb(65, 171, 93)';
  };

  getNonInitiativeTitle = () => {
    return 'Other activities (not related to initiatives)';
  };

  getCellDataInitiatives = (initiative: string, weekTxt: string) => {
    const { roadmap } = this.props;
    if (initiative !== this.getNonInitiativeTitle()) {
      return roadmap.byInitiative
        .find((i: any) => this.getInitiativeTitle(i) === initiative)
        .weeks.find((w: any) => w.weekTxt === weekTxt).list;
    } else {
      return this.completionWeeks[weekTxt].nonInitiativesList;
    }
  };

  getInitiativeTitle = (initiative: any) => {
    return initiative.fields.summary + ' (' + initiative.key + ')';
  };

  cellClick = (initiative: string, weekTxt: string) => {
    const { roadmap, defaultPoints } = this.props;
    console.log(this.completionWeeks[weekTxt]);
    const cellDataInitiatives = this.getCellDataInitiatives(
      initiative,
      weekTxt
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
    console.log(roadmap);
    let metric = 'points';
    if (!defaultPoints) {
      metric = 'issues';
    }

    let dataset: Array<IDatasetObj> = [];
    for (let initiative of roadmap.byInitiative.filter(
      (i: any) => i.metrics[metric].completed > 0
    )) {
      const initiativeData: IDatasetObj = {
        initiative: this.getInitiativeTitle(initiative)
      };
      for (let week of initiative.weeks) {
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
    let nonInitiatives: any = {
      initiative: this.getNonInitiativeTitle()
    };
    for (let week of Object.values(this.completionWeeks)) {
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
    return (
      <div style={{ height: chartHeight }}>
        // @ts-ignore
        <ResponsiveHeatMap
          data={this.dataset}
          keys={roadmap.byInitiative[0].weeks.map((w: any) => w.weekTxt)}
          indexBy='initiative'
          margin={{ top: 0, right: 30, bottom: 60, left: 300 }}
          pixelRatio={2}
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
          defs={[
            {
              id: 'lines',
              type: 'patternLines',
              background: 'inherit',
              color: 'rgba(0, 0, 0, 0.1)',
              rotation: -45,
              lineWidth: 4,
              spacing: 7
            }
          ]}
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
          fill={[{ id: 'lines' }]}
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
