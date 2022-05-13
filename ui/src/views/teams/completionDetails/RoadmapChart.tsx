import React, { FC } from 'react';
// //https://github.com/plouc/nivo/issues/1967
// const RoadmapChart: FC<any> = ({ streams, metric }) => {
//   const streamWithWeeks: Array<Stream> = addWeeksToStreams(streams, metric);
//   console.log(streamWithWeeks);
//   return <span>TO BE IMPLEMENTED</span>
// };
// export default RoadmapChart;

import {
  endOfWeek,
  startOfWeek,
  startOfMonth,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  add,
  getYear,
  getWeek,
  format,
  isEqual,
} from 'date-fns';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';

import toMaterialStyle from 'material-color-hash';

// import { ResponsiveHeatMap, ComputedCell } from '@nivo/heatmap';

import { Stream, StreamWeek, StreamItem } from '../../../global';

interface DatasetObj {
  [key: string]: any;
}

interface MonthTable {
  startOfMonth: Date;
  colSpan: number;
}

const RoadmapChart: FC<any> = ({ streams, metric }) => {
  // console.log(streams);
  if (streams.length === null) {
    return null;
  }

  // Flatten the list of items and build full array of weeks
  const items: Array<StreamItem> = [];
  const weeks: Array<string> = [];
  for (const s of streams) {
    items.push(s);
    if (s.weeks === undefined) {
      break;
    }
    for (const w of s.weeks) {
      if (!weeks.includes(w.firstDay.toISOString())) {
        weeks.push(w.firstDay.toISOString());
      }
    }
  }

  const chartHeight = 50 + items.length * 25;

  // Create an array of Months cased on the included weeks
  const months = weeks
    .sort()
    .reduce((acc: Array<MonthTable>, weekStart: string) => {
      const currentMonth = acc.find((m: any) =>
        isEqual(m.startOfMonth, startOfMonth(new Date(weekStart))),
      );
      if (currentMonth === undefined) {
        acc.push({
          startOfMonth: startOfMonth(new Date(weekStart)),
          colSpan: 1,
        });
      } else {
        return acc.map((m: MonthTable) => {
          if (isEqual(m.startOfMonth, startOfMonth(new Date(weekStart)))) {
            return {
              ...m,
              colSpan: m.colSpan + 1,
            };
          } else {
            return m;
          }
        });
      }
      return acc;
    }, []);

  const WeekCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.root}`]: {
      padding: 0,
      width: 30,
    },
    [`&.${tableCellClasses.head}`]: {
      fontSize: 10,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 10,
    },
  }));

  return (
    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
      <TableHead>
        <TableRow>
          <TableCell rowSpan={2}>Activities</TableCell>
          {months.sort().map((m: any) => (
            <TableCell key={m.startOfMonth} colSpan={m.colSpan} align="center">
              {format(new Date(m.startOfMonth), 'LLL')}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          {weeks.sort().map((weekStartTxt) => (
            <WeekCell key={weekStartTxt} align="center">
              {format(new Date(weekStartTxt), 'do')}
            </WeekCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((i: any) => (
          <TableRow
            key={i.key}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell component="th" scope="row">
              {i.name}
            </TableCell>
            {weeks.sort().map((weekStartTxt) => {
              let value = '';
              const currentWeek = i.weeks.find(
                (w: any) =>
                  startOfWeek(w.firstDay).toISOString() === weekStartTxt,
              );
              if (currentWeek !== undefined) {
                value =
                  currentWeek.metrics[metric].count === 0
                    ? ''
                    : currentWeek.metrics[metric].count;
              }
              return (
                <WeekCell key={weekStartTxt} align="center">
                  {value}
                </WeekCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // return <span>Test</span>;
  // return (
  //   <div style={{ height: chartHeight }}>
  //     <ResponsiveHeatMap
  //       data={formattedItems}
  //       keys={weeks.sort()}
  //       indexBy="item"
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
  //         format: (weekTxt: string) => format(new Date(weekTxt), 'LLL do'),
  //       }}
  //       axisLeft={{
  //         orient: 'middle',
  //         tickSize: 5,
  //         tickPadding: 5,
  //         tickRotation: 0,
  //         legend: '',
  //         legendPosition: 'middle',
  //         legendOffset: -40,
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
  //               console.log('Cell Click');
  //             }}
  //             style={{ cursor: 'pointer' }}
  //           >
  //             <rect
  //               x={width * -0.5}
  //               y={height * -0.5}
  //               width={width}
  //               height={height}
  //               fill={getCompletionColor(data, value)}
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
