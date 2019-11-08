import React from 'react';
import Grid from '@material-ui/core/Grid';
import _ from 'lodash';

import { getCellDataInitiatives } from '../utils';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import DataBreakdown from './DataBreakdown';

export interface TooltipProps {
  data: any;
  roadmap: any;
  completionWeeks: any;
  defaultPoints: boolean;
}

export default function RoadmapTooltip(props: TooltipProps) {
  const { data, roadmap, defaultPoints } = props;
  const initiatives = getCellDataInitiatives(data.yKey, data.xKey, roadmap);

  const typesGroup = _.groupBy(initiatives, (value: any) => {
    if (value.type !== undefined) {
      return value.type.name;
    } else {
      return null;
    }
  });

  const types: any = [];
  Object.keys(typesGroup).forEach((key: any) => {
    types.push({
      name: key,
      list: typesGroup[key],
      issues: {
        count: typesGroup[key].length,
      },
      points: {
        count: typesGroup[key]
          .map(issue => issue.points)
          .reduce((acc, count) => acc + count, 0),
      },
    });
  });

  const projectsGroup = _.groupBy(initiatives, value =>
    value.key.replace(/[^a-z+]+/gi, ''),
  );
  const projects: any = [];
  Object.keys(projectsGroup).forEach((key: any) => {
    projects.push({
      name: key,
      list: projectsGroup[key],
      issues: {
        count: projectsGroup[key].length,
      },
      points: {
        count: projectsGroup[key]
          .map((issue: any) => {
            return issue.points;
          })
          .reduce((acc: number, count: number) => acc + count, 0),
      },
    });
  });
  return (
    <React.Fragment>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell align="right">Summary</TableCell>
            <TableCell align="right">Points</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {initiatives.slice(0, 5).map((i: any) => (
            <TableRow key={i.key}>
              <TableCell component="th" scope="row">
                {i.key}
              </TableCell>
              <TableCell align="right">{i.summary}</TableCell>
              <TableCell align="right">{i.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {initiatives.length > 5 && (
        <span>
          <b>Caution:</b>{' '}
          <i>
            This table only displays the first 5 results (out of{' '}
            {initiatives.length}).
          </i>
        </span>
      )}
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid item xs={6}>
          <Typography variant="h6" component="h6">
            Projects
          </Typography>
          <DataBreakdown dataset={projects} defaultPoints={defaultPoints} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h6" component="h6">
            Types
          </Typography>
          <DataBreakdown dataset={types} defaultPoints={defaultPoints} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
