import React, { FC } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid/Grid';
import { Avatar, CounterLabel } from '@primer/components';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: '5px'
    },
    repoName: {
      color: '#586069!important',
      fontSize: '14px',
      marginRight: '5px',
      textDecoration: 'none'
    },
    issueTitle: {
      fontSize: '14px',
      color: '#000000!important',
      textDecoration: 'none'
    },
    issueSubTitle: {
      textDecoration: 'none',
      fontSize: '10px',
      color: '#586069!important'
    }
  })
);

const IssueCompact: FC<any> = ({ issue }) => {
  const classes = useStyles();
  return (
    <Paper className={classes.root} elevation={1}>
      <Grid
        container
        direction='row'
        justify='flex-start'
        alignItems='flex-start'
        spacing={1}
      >
        <Grid item>
          <Tooltip title={issue.fields.issuetype.name}>
            <Avatar mb={0} src={issue.fields.issuetype.iconUrl} size={20} />
          </Tooltip>
        </Grid>
        <Grid item xs={12} sm container>
          <a
            href={issue.host + '/browse/' + issue.key}
            className={classes.repoName}
            target='_blank'
            rel='noopener noreferrer'
          >
            {issue.key}
          </a>
        </Grid>
        {issue.fields.assignee !== null && (
          <Grid item>
            <Tooltip title={issue.fields.assignee.displayName}>
              <Avatar
                mb={0}
                src={issue.fields.assignee.avatarUrls['48x48']}
                size={24}
              />
            </Tooltip>
          </Grid>
        )}
      </Grid>
      <Grid
        container
        direction='row'
        justify='flex-start'
        alignItems='flex-start'
        spacing={1}
      >
        <Grid item xs={12} sm container>
          <a
            href={issue.host + '/browse/' + issue.key}
            className={classes.issueTitle}
            target='_blank'
            rel='noopener noreferrer'
          >
            {issue.fields.summary}
          </a>
        </Grid>
      </Grid>
      <Grid
        container
        direction='row'
        justify='flex-start'
        alignItems='flex-end'
        spacing={1}
      >
        <Grid item xs={12} sm container className={classes.issueSubTitle}>
          <span>Workflow: {issue.fields.status.name}</span>
        </Grid>
        <Grid item>
          <Tooltip title='Story points'>
            <CounterLabel>{issue.points}</CounterLabel>
          </Tooltip>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default IssueCompact;
