import React, { FC } from 'react';

//https://github.com/plouc/nivo/issues/1967
const RoadmapChart: FC<any> = ({
  defaultPoints,
  issues,
  jiraHost,
  setGraphInitiative,
  updateGraph,
  setOpenGraph,
  setJiraHost,
}) => {
  return null;
};
export default RoadmapChart;

// import {
//   endOfWeek,
//   startOfWeek,
//   differenceInDays,
//   differenceInHours,
//   differenceInMinutes,
//   add,
//   getYear,
//   getWeek,
//   format,
// } from 'date-fns';

// import toMaterialStyle from 'material-color-hash';

// import { ResponsiveHeatMap, ComputedCell } from '@nivo/heatmap';

// import { Stream, StreamWeek, StreamItem } from '../../../global';

// interface DatasetObj {
//   [key: string]: any;
// }

// // Note:
// // differenceInDays only return full days which means the the differenceInDays
// // between first and last day of the week is going to be 6. We can instead use
// // differenceInMinutes / 1440 which gives a number close enough

// const buildWeekData = (
//   firstDay: Date,
//   lastDay: Date,
//   dailyVelocity: number,
//   remainingAtWeekdStart: number,
//   remainingAtWeekEnd: number,
// ) => {
//   return {
//     firstWeekDay: firstDay,
//     lastWeekDay: lastDay,
//     startOfWeek: startOfWeek(firstDay),
//     endOfWeek: endOfWeek(firstDay),
//     weekTxt: endOfWeek(firstDay).toISOString(),
//     completed:
//       Math.round(
//         (differenceInMinutes(endOfWeek(firstDay), firstDay) / 1440) *
//           dailyVelocity *
//           10,
//       ) / 10,
//     remaining: {
//       atWeekStart: Math.round(remainingAtWeekdStart * 10) / 10,
//       atWeekEnd: Math.round(remainingAtWeekEnd * 10) / 10,
//     },
//   };
// };

// // Builds a future calendar based on the weeks necessary to complete the initiative
// const buildCalendar = (
//   weeklyVelocity: number,
//   remaining: number,
//   firstDay: Date,
// ) => {
//   const perDayVelocity = weeklyVelocity / 7; // No particular logic for business days
//   const weeks: Array<StreamWeek> = [];

//   let currentRemaining =
//     remaining -
//     differenceInDays(endOfWeek(firstDay), firstDay) * perDayVelocity;

//   // The first week is always calculated by day
//   weeks.push(
//     buildWeekData(
//       firstDay,
//       endOfWeek(firstDay),
//       perDayVelocity,
//       remaining,
//       currentRemaining,
//     ),
//   );

//   let weekStartCursor = startOfWeek(firstDay);
//   while (currentRemaining > 0) {
//     weekStartCursor = add(weekStartCursor, { days: 7 });
//     let completed = weeklyVelocity;
//     let atWeekEnd = currentRemaining - weeklyVelocity;
//     let lastWeekDay = endOfWeek(weekStartCursor);
//     // If weekly velocity is greater than remaining, it means
//     // completion is going to be in the middle of the week
//     if (weeklyVelocity > currentRemaining) {
//       const effortDays = currentRemaining / perDayVelocity;
//       lastWeekDay = add(weekStartCursor, { days: effortDays });
//     }
//     if (atWeekEnd <= 0) {
//       completed = atWeekEnd + completed;
//       atWeekEnd = 0;
//     }
//     weeks.push(
//       buildWeekData(
//         weekStartCursor,
//         lastWeekDay,
//         perDayVelocity,
//         currentRemaining,
//         atWeekEnd,
//       ),
//     );
//     currentRemaining = currentRemaining - weeklyVelocity;
//   }
//   return weeks;
// };

// const addWeeksToStreams = (streams: Array<any>, metric: string) => {
//   return streams.map((s) => {
//     if (s.metrics[metric].velocity === 0) {
//       return {
//         ...s,
//         weeks: [],
//       };
//     }
//     const items = [];
//     const streamVelocity = s.metrics[metric].velocity;
//     if (s.items !== undefined) {
//       let startDay = new Date();
//       for (const i of s.items) {
//         const weeks: Array<StreamWeek> = buildCalendar(
//           streamVelocity,
//           i.remaining,
//           startDay,
//         );
//         items.push({
//           ...i,
//           stream: s.name,
//           name: `${s.name}: ${i.name}`,
//           weeks,
//         });
//         startDay = weeks.slice(-1)[0].lastWeekDay;
//       }
//     }
//     return {
//       ...s,
//       items,
//       weeks: buildCalendar(streamVelocity, s.remaining, new Date()),
//     };
//   });
// };

// const RoadmapChart: FC<any> = ({ streams, metric }) => {
//   // Build a weekly completion forecast calendar
//   const streamWithWeeks: Array<Stream> = addWeeksToStreams(streams, metric);
//   // Flatten the list of items and build full array of weeks
//   const items: Array<StreamItem> = [];
//   const weeks: Array<string> = [];
//   for (const s of streamWithWeeks) {
//     if (s.items.length === 0) {
//       items.push(s);
//       if (s.weeks === undefined) {
//         break;
//       }
//       for (const w of s.weeks) {
//         if (!weeks.includes(w.weekTxt)) {
//           weeks.push(w.weekTxt);
//         }
//       }
//     } else {
//       for (const i of s.items) {
//         items.push(i);
//         if (i.weeks === undefined) {
//           break;
//         }
//         for (const w of i.weeks) {
//           if (!weeks.includes(w.weekTxt)) {
//             weeks.push(w.weekTxt);
//           }
//         }
//       }
//     }
//   }

//   const formattedItems: DatasetObj[] = [];
//   for (const i of items) {
//     const initiativeData: DatasetObj = {
//       item: i.name,
//     };
//     if (i.weeks === undefined) {
//       return null;
//     }
//     for (const week of i.weeks) {
//       initiativeData[week.weekTxt] = week.completed;
//     }
//     formattedItems.push(initiativeData);
//   }

//   const chartHeight = 50 + items.length * 25;

//   const getCompletionColor = (data: any, value: any) => {
//     if (value === undefined) {
//       return 'rgb(255, 255, 255)';
//     }
//     const item = items.find((i: StreamItem) => i.name === data.yKey);
//     if (item !== undefined) {
//       return toMaterialStyle(
//         item.stream === undefined ? item.name : item.stream,
//         200,
//       ).backgroundColor;
//     }
//     return toMaterialStyle(data.yKey, 200).backgroundColor;
//   };

//   return (
//     <div style={{ height: chartHeight }}>
//       <ResponsiveHeatMap
//         data={formattedItems}
//         keys={weeks.sort()}
//         indexBy="item"
//         margin={{ top: 0, right: 30, bottom: 60, left: 300 }}
//         forceSquare={false}
//         axisTop={null}
//         axisRight={null}
//         cellBorderWidth={1}
//         axisBottom={{
//           orient: 'top',
//           tickSize: 5,
//           tickPadding: 5,
//           tickRotation: -90,
//           legend: '',
//           legendOffset: 36,
//           format: (weekTxt: string) => format(new Date(weekTxt), 'LLL do'),
//         }}
//         axisLeft={{
//           orient: 'middle',
//           tickSize: 5,
//           tickPadding: 5,
//           tickRotation: 0,
//           legend: '',
//           legendPosition: 'middle',
//           legendOffset: -40,
//         }}
//         cellOpacity={1}
//         cellBorderColor={'#a4a3a5'}
//         labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
//         cellShape={({
//           data,
//           value,
//           x,
//           y,
//           width,
//           height,
//           color,
//           opacity,
//           borderWidth,
//           borderColor,
//           enableLabel,
//           textColor,
//           onHover,
//           onLeave,
//           onClick,
//           theme,
//         }: any) => {
//           if (value === 0) {
//             return (
//               <g
//                 transform={`translate(${x}, ${y})`}
//                 style={{ cursor: 'pointer' }}
//               >
//                 <rect
//                   x={width * -0.5}
//                   y={height * -0.5}
//                   width={width}
//                   height={height}
//                   fill={''}
//                   fillOpacity={0}
//                   strokeWidth={borderWidth}
//                   stroke={borderColor}
//                   strokeOpacity={opacity}
//                 />
//               </g>
//             );
//           }
//           return (
//             <g
//               transform={`translate(${x}, ${y})`}
//               onMouseEnter={onHover}
//               onMouseMove={onHover}
//               onMouseLeave={onLeave}
//               onClick={(e) => {
//                 console.log('Cell Click');
//               }}
//               style={{ cursor: 'pointer' }}
//             >
//               <rect
//                 x={width * -0.5}
//                 y={height * -0.5}
//                 width={width}
//                 height={height}
//                 fill={getCompletionColor(data, value)}
//                 fillOpacity={opacity}
//                 strokeWidth={borderWidth}
//                 stroke={borderColor}
//                 strokeOpacity={opacity}
//               />
//               {enableLabel && (
//                 <text
//                   dominantBaseline="central"
//                   textAnchor="middle"
//                   style={{
//                     ...theme.labels.text,
//                     fill: textColor,
//                   }}
//                   fillOpacity={opacity}
//                 >
//                   {value}
//                 </text>
//               )}
//             </g>
//           );
//         }}
//         animate={false}
//         motionStiffness={80}
//         motionDamping={9}
//         hoverTarget="row"
//         cellHoverOthersOpacity={0.1}
//       />
//     </div>
//   );
// };

// export default RoadmapChart;
