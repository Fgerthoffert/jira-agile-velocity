import React, { FC } from 'react';
import { endOfWeek, startOfWeek } from 'date-fns';

import { ResponsiveHeatMap } from '@nivo/heatmap';

const buildCalendar = (weeklyVelocity: number, remaining: number) => {
  const nbWeeks = remaining / weeklyVelocity;
  const perDay = weeklyVelocity / 7; // No particular logic for business days

  const currentDay = new Date();
  console.log('Current Day: ' + currentDay);
  console.log('Last Day of current week: ' + endOfWeek(currentDay));
  console.log('First Day of current week: ' + startOfWeek(currentDay));

  const weeks = [];

  // The first week is always calculated by day
  weeks.push({
    firstWeekDay: startOfWeek(currentDay),
    lastWeekDay: endOfWeek(currentDay),
  });

  return weeks;
};

const RoadmapChart: FC<any> = ({ streams, weeklyVelocity }) => {
  streams = [
    {
      key: 'initiatives',
      name: 'Initiatives',
      remaining: 40,
      effortPct: 50,
      items: [
        {
          name: 'Feature 1',
          remaining: 45,
        },
        {
          name: 'Feature 1',
          remaining: 125,
        },
      ],
    },
    {
      key: 'bugs',
      name: 'Bugs',
      remaining: 70,
      effortPct: 20,
    },
    {
      key: 'others',
      name: 'Others',
      remaining: 25,
      effortPct: 30,
    },
  ];

  console.log(streams);

  // Build an empty calendar
  const withWeeks = streams.map((s: any) => {
    return {
      ...s,
      weeks: buildCalendar(s.remaining, weeklyVelocity),
    };
  });

  console.log(withWeeks);
  // We need to represent the streams in weekly arrays

  const chartHeight = 50 + streams.length * 25;
  return <span>abcdefgh</span>;

  // return (
  //   <div style={{ height: chartHeight }}>
  //     <ResponsiveHeatMap
  //       data={this.buildDataset(initiatives)}
  //       keys={initiatives[0].weeks.map((w: any) => w.weekEnd)}
  //       indexBy="initiative"
  //       margin={{ top: 0, right: 30, bottom: 60, left: 300 }}
  //       forceSquare={false}
  //       axisTop={null}
  //       axisRight={null}
  //       cellBorderWidth={1}
  //       axisBottom={{
  //         orient: 'top',
  //         tickSize: 5,
  //         tickPadding: 5,
  //         tickRotation: -90,
  //         legend: '',
  //         legendOffset: 36,
  //         format: (weekEnd: string) => this.formatWeekEnd(weekEnd),
  //       }}
  //       axisLeft={{
  //         orient: 'middle',
  //         tickSize: 5,
  //         tickPadding: 5,
  //         tickRotation: 0,
  //         legend: '',
  //         legendPosition: 'middle',
  //         legendOffset: -40,
  //         onClick: (event: any, key: string) => {
  //           this.clickLegend(key);
  //         },
  //       }}
  //       cellOpacity={1}
  //       cellBorderColor={'#a4a3a5'}
  //       labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
  //       cellShape={({
  //         data,
  //         value,
  //         x,
  //         y,
  //         width,
  //         height,
  //         color,
  //         opacity,
  //         borderWidth,
  //         borderColor,
  //         enableLabel,
  //         textColor,
  //         onHover,
  //         onLeave,
  //         onClick,
  //         theme,
  //       }: any) => {
  //         if (value === 0) {
  //           return (
  //             <g
  //               transform={`translate(${x}, ${y})`}
  //               style={{ cursor: 'pointer' }}
  //             >
  //               <rect
  //                 x={width * -0.5}
  //                 y={height * -0.5}
  //                 width={width}
  //                 height={height}
  //                 fill={''}
  //                 fillOpacity={0}
  //                 strokeWidth={borderWidth}
  //                 stroke={borderColor}
  //                 strokeOpacity={opacity}
  //               />
  //             </g>
  //           );
  //         }
  //         return (
  //           <g
  //             transform={`translate(${x}, ${y})`}
  //             onMouseEnter={onHover}
  //             onMouseMove={onHover}
  //             onMouseLeave={onLeave}
  //             onClick={(e) => {
  //               this.cellClick(data.yKey, data.xKey);
  //             }}
  //             style={{ cursor: 'pointer' }}
  //           >
  //             <rect
  //               x={width * -0.5}
  //               y={height * -0.5}
  //               width={width}
  //               height={height}
  //               fill={this.getCompletionColor(data, value)}
  //               fillOpacity={opacity}
  //               strokeWidth={borderWidth}
  //               stroke={borderColor}
  //               strokeOpacity={opacity}
  //             />
  //             {enableLabel && (
  //               <text
  //                 dominantBaseline="central"
  //                 textAnchor="middle"
  //                 style={{
  //                   ...theme.labels.text,
  //                   fill: textColor,
  //                 }}
  //                 fillOpacity={opacity}
  //               >
  //                 {value}
  //               </text>
  //             )}
  //           </g>
  //         );
  //       }}
  //       animate={false}
  //       motionStiffness={80}
  //       motionDamping={9}
  //       hoverTarget="row"
  //       cellHoverOthersOpacity={0.1}
  //     />
  //   </div>
  // );
};

export default RoadmapChart;
