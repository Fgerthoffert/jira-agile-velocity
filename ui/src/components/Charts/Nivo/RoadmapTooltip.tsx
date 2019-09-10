import React from 'react';

import { getCellDataInitiatives } from './utils';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

export interface TooltipProps {
  data: any;
  roadmap: any;
  completionWeeks: any;
}

export default function RoadmapTooltip(props: TooltipProps) {
  const { data, roadmap, completionWeeks } = props;
  const initiatives = getCellDataInitiatives(
    data.yKey,
    data.xKey,
    roadmap,
    completionWeeks
  );

  return (
    <React.Fragment>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell align='right'>Summary</TableCell>
            <TableCell align='right'>Points</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {initiatives.slice(0, 5).map((i: any) => (
            <TableRow key={i.key}>
              <TableCell component='th' scope='row'>
                {i.key}
              </TableCell>
              <TableCell align='right'>{i.fields.summary}</TableCell>
              <TableCell align='right'>{i.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {initiatives.length > 10 && (
        <span>
          <b>Caution:</b> The tooltip only displays the first 5 results.
        </span>
      )}
    </React.Fragment>
  );
}
