import React, { FC } from 'react';
// //https://github.com/plouc/nivo/issues/1967
// const RoadmapChart: FC<any> = ({ streams, metric }) => {
//   const streamWithWeeks: Array<Stream> = addWeeksToStreams(streams, metric);
//   console.log(streamWithWeeks);
//   return <span>TO BE IMPLEMENTED</span>
// };
// export default RoadmapChart;

import { format, isEqual } from 'date-fns';

import {
  Heatmap,
  HeatmapSeries,
  HeatmapCell,
  schemes,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
  LinearYAxis,
  LinearYAxisTickSeries,
  LinearYAxisTickLabel,
  ChartTooltip,
} from 'reaviz';

interface DatasetObj {
  [key: string]: any;
}

interface MonthTable {
  startOfMonth: Date;
  colSpan: number;
}

const heatmapSimpleData = [
  {
    key: 'Lateral Movement',
    data: [
      {
        key: 'XML',
        data: 0,
      },
      {
        key: 'JSON',
        data: 120,
      },
      {
        key: 'HTTPS',
        data: 150,
      },
      {
        key: 'SSH',
        data: 112,
      },
    ],
  },
  {
    key: 'Discovery',
    data: [
      {
        key: 'XML',
        data: 100,
      },
      {
        key: 'JSON',
        data: 34,
      },
      {
        key: 'HTTPS',
        data: 0,
      },
      {
        key: 'SSH',
        data: 111,
      },
    ],
  },
  {
    key: 'Exploitation',
    data: [
      {
        key: 'XML',
        data: 70,
      },
      {
        key: 'JSON',
        data: 1,
      },
      {
        key: 'HTTPS',
        data: 110,
      },
      {
        key: 'SSH',
        data: 115,
      },
    ],
  },
  {
    key: 'Threat Intelligence',
    data: [
      {
        key: 'XML',
        data: 1,
      },
      {
        key: 'JSON',
        data: 120,
      },
      {
        key: 'HTTPS',
        data: 200,
      },
      {
        key: 'SSH',
        data: 160,
      },
    ],
  },
  {
    key: 'Breach',
    data: [
      {
        key: 'XML',
        data: 5,
      },
      {
        key: 'JSON',
        data: 10,
      },
      {
        key: 'HTTPS',
        data: 152,
      },
      {
        key: 'SSH',
        data: 20,
      },
    ],
  },
];

const RoadmapChartR: FC<any> = ({ streams, metric }) => {
  // console.log(streams);
  // console.log(heatmapSimpleData);

  if (streams.length === 0) {
    return null;
  }
  const heatmapData = streams[0].weeks.map((w: any) => {
    return {
      key: format(w.firstDay, 'LLL do'),
      data: streams
        .map((s: any) => {
          const wf = s.weeks.find((wf: any) =>
            isEqual(wf.firstDay, w.firstDay),
          );
          return {
            key: s.name,
            // Must return null if value is 0
            // https://github.com/reaviz/reaviz/blob/1e0794f4c427aaeb3c393139501f9c361eb6423a/src/Heatmap/HeatmapSeries/HeatmapSeries.tsx#L68
            data:
              wf.metrics[metric].count > 0 ? wf.metrics[metric].count : null,
          };
        })
        .reverse(),
    };
  });
  // console.log(schemes);
  // console.log(heatmapData);
  return (
    <Heatmap
      height={400}
      width={600}
      data={heatmapData}
      xAxis={
        <LinearXAxis
          type="category"
          axisLine={null}
          tickSeries={
            <LinearXAxisTickSeries
              label={<LinearXAxisTickLabel padding={5} />}
            />
          }
        />
      }
      yAxis={
        <LinearYAxis
          type="category"
          axisLine={null}
          tickSeries={
            <LinearYAxisTickSeries
              line={null}
              label={<LinearYAxisTickLabel padding={5} />}
            />
          }
        />
      }
      series={
        <HeatmapSeries
          colorScheme={schemes.Greens}
          emptyColor={'#fff'}
          padding={0.01}
          cell={
            <HeatmapCell
              style={{ stroke: '#9f9f9f' }}
              tooltip={<ChartTooltip />}
            />
          }
        />
      }
    />
  );
};

export default RoadmapChartR;
