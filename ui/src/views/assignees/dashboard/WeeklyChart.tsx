import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

export interface WeeklyChartsProps {
  assignees: any;
  defaultPoints: boolean;
  type: string;
}

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

export default function WeeklyChart(props: WeeklyChartsProps) {
  const { assignees, defaultPoints, type } = props;
  const classes = useStyles();

  let metric = 'points';
  if (!defaultPoints) {
    metric = 'issues';
  }

  const slicedAssignees = {
    ...assignees, 
    velocity: assignees.velocity.map((a: any) => {
      const weeks = a.weeks.slice(-16)
      return {
        ...a,
        weeks: weeks,
        totalIssues: weeks.map((w: any) => w.completion.issues.count).reduce((acc: number, count: number) => acc + count, 0),
      }
    }).filter((a: any) => a.totalIssues > 0)
  }
  
  const getCountCell = (week: any) => {
    const jiraHost = slicedAssignees.host;
    let jqlString = `key in (${week.completion.list.map((i: any) => i.key).join(',')})`
    const url = jiraHost + '/issues/?jql=' + jqlString;           
    return (
      <TableCell align="right" key={week.weekTxt}>
        {week.completion[metric][type] !== 0 ? <><a href={url} target="_blank">{Math.round(week.completion[metric][type] * 10) / 10}</a></> : ''}
      </TableCell>
    )    
  }

  return (
      <TableContainer>
          <Table className={classes.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Assignee</TableCell>
                {slicedAssignees.velocity[0].weeks.map((w: any) => (
                    <TableCell align="right" key={w.weekTxt}>{w.weekTxt}</TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {slicedAssignees.velocity
                .filter((a:any) => !['ALL', 'EMPTY'].includes(a.name))
                .sort((a: any, b: any) => {
                  const aV = a.weeks[a.weeks.length - 1].completion[metric].velocity 
                  const bV = b.weeks[b.weeks.length - 1].completion[metric].velocity
                  if ( aV > bV ){
                    return -1;
                  }         
                  if ( aV < bV ){
                    return 1;
                  }
                  return 0
                })
                .map((a: any) => (
                <TableRow key={a.name}>
                  <TableCell component="th" scope="row">
                    {a.name}
                  </TableCell>
                  {a.weeks.map((w: any) => getCountCell(w))}
                </TableRow>
              ))}
              {slicedAssignees.velocity.filter((a:any) => ['ALL', 'EMPTY'].includes(a.name)).map((a: any) => (
                <TableRow key={a.name}>
                  <TableCell component="th" scope="row">
                    {a.name}
                  </TableCell>
                  {a.weeks.map((w: any) => getCountCell(w))}
                </TableRow>
              ))} 
            </TableBody>
          </Table>
      </TableContainer>
  );
}
