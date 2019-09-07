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

class RoadmapChart extends Component<any, any> {
  completionWeeks: any = {};

  /* 
    Display different background colors based on the percentage of the effort spent on a particular activity for a week
  */
  getCompletionColor = (data: any, value: any) => {
    const prct = Math.round(
      (value * 100) / this.completionWeeks[data.xKey].total
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

  buildDataset = () => {
    const { roadmap, defaultPoints, type } = this.props;
    console.log(roadmap);
    let metric = 'points';
    if (!defaultPoints) {
      metric = 'issues';
    }

    let dataset: Array<IDatasetObj> = [];
    for (let initiative of roadmap[type]) {
      const initiativeData: IDatasetObj = {
        initiative: initiative.fields.summary + ' (' + initiative.key + ')'
      };
      for (let week of initiative.weeks) {
        if (this.completionWeeks[week.weekTxt] === undefined) {
          const teamCompletionWeek = roadmap.byTeam
            .find((t: any) => t.name === null)
            .weeks.find((w: any) => w.weekStart === week.weekStart);
          console.log(teamCompletionWeek);
          this.completionWeeks[week.weekTxt] = {
            weekStart: week.weekStart,
            weekTxt: week.weekTxt,
            total:
              teamCompletionWeek !== undefined
                ? teamCompletionWeek[metric].count
                : 0,
            initiatives: 0,
            nonInitiatives:
              teamCompletionWeek !== undefined
                ? teamCompletionWeek[metric].count
                : 0
          };
        } else {
          this.completionWeeks[week.weekTxt].initiatives =
            this.completionWeeks[week.weekTxt].initiatives + week[metric].count;
          this.completionWeeks[week.weekTxt].nonInitiatives =
            this.completionWeeks[week.weekTxt].total -
            this.completionWeeks[week.weekTxt].initiatives;
        }
        initiativeData[week.weekTxt] = week[metric].count;
      }
      dataset.push(initiativeData);
    }
    if (type === 'byInitiative') {
      let nonInitiatives: any = {
        initiative: 'Other activities (not related to initiatives)'
      };
      for (let week of Object.values(this.completionWeeks)) {
        // @ts-ignore
        nonInitiatives[week.weekTxt] = week.nonInitiatives;
      }
      dataset.push(nonInitiatives);
    }
    console.log(dataset);
    return dataset;
  };

  render() {
    const { roadmap, type } = this.props;
    this.completionWeeks = {};
    const chartHeight = roadmap[type].length * 20;
    return (
      <div style={{ height: chartHeight }}>
        // @ts-ignore
        <ResponsiveHeatMap
          data={this.buildDataset()}
          keys={roadmap[type][0].weeks.map((w: any) => w.weekTxt)}
          indexBy='initiative'
          margin={{ top: 30, right: 30, bottom: 60, left: 300 }}
          pixelRatio={2}
          forceSquare={true}
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

export default withStyles(styles)(RoadmapChart);

/*
      <div style={{ height: chartHeight }}>
        // @ts-ignore
        <ResponsiveHeatMapCanvas
          data={this.buildDataset().slice(0, 20)}
          keys={roadmap.byInitiative[0].weeks.map((w: any) => w.weekTxt)}
          indexBy='initiative'
          margin={{ top: 100, right: 60, bottom: 60, left: 300 }}
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
                  onClick(data, e);
                }}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={width * -0.5}
                  y={height * -0.5}
                  width={width}
                  height={height}
                  fill={color}
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
          animate={true}
          motionStiffness={80}
          motionDamping={9}
          hoverTarget='cell'
          cellHoverOthersOpacity={0.25}
        />
      </div>
*/
