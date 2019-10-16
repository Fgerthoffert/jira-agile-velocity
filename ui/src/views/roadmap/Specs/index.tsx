import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { FC } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import format from 'date-fns/format';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { connect } from 'react-redux';

import { iRootState } from '../../../store';
import IssueCompact from '../../../components/Issue/IssueCompact';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3, 2)
    },
    smallText: {
      fontSize: '0.8em'
    },
    updatedAt: {
      textAlign: 'left',
      fontSize: '0.8em',
      fontStyle: 'italic'
    }
  })
);

const mapState = (state: iRootState) => ({
  defaultPoints: state.global.defaultPoints,
  roadmap: state.roadmap.roadmap,
  selectedTab: state.roadmap.selectedTab
});

type connectedProps = ReturnType<typeof mapState>;

const Specs: FC<connectedProps> = ({ roadmap, selectedTab }) => {
  const classes = useStyles();
  if (Object.values(roadmap).length > 0 && selectedTab === 'prep') {
    return (
      <Grid
        container
        direction='column'
        justify='flex-start'
        alignItems='stretch'
        spacing={1}
      >
        <Grid item xs={12} className={classes.updatedAt}>
          <span>
            Last updated:{' '}
            {format(new Date(roadmap.updatedAt), 'E yyyy/MM/dd, hh:mm a')}
          </span>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.root}>
            <Grid
              container
              direction='row'
              justify='space-evenly'
              alignItems='stretch'
              wrap='nowrap'
            >
              {roadmap.bySpecsState.map((stateColumn: any) => {
                return (
                  <Grid item xs key={stateColumn.name}>
                    <Typography variant='h6' component='h6'>
                      {stateColumn.name}
                    </Typography>
                    <List>
                      {stateColumn.list.map((issue: any) => {
                        return (
                          <ListItem key={issue.id}>
                            <IssueCompact issue={issue} />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  } else {
    return null;
  }
};

export default connect(
  mapState,
  null
)(Specs);
