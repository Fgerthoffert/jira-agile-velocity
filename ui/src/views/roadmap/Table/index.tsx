import Grid, { GridSpacing } from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import MaterialTable from "material-table";

import React, { FC } from "react";
import ReactDOM from "react-dom";

import { connect } from "react-redux";

import { iRootState } from "../../../store";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3, 2)
    }
  })
);

const mapState = (state: iRootState) => ({
  defaultPoints: state.global.defaultPoints,
  roadmap: state.roadmap.roadmap
});

const mapDispatch = (dispatch: any) => ({
  setDefaultPoints: dispatch.global.setDefaultPoints
});

const flattenData = (initiatives: any, metric: string) => {
  const issues = [];
  for (let initiative of initiatives) {
    issues.push({
      type: initiative.fields.issuetype.name,
      key: initiative.key,
      title: initiative.fields.summary,
      state: initiative.fields.status.name,
      points: initiative.metrics[metric].total,
      id: parseInt(initiative.id, 10)
    });
    if (initiative.children.length > 0) {
      for (let childl1 of initiative.children) {
        issues.push({
          type: childl1.fields.issuetype.name,
          key: childl1.key,
          title: childl1.fields.summary,
          state: childl1.fields.status.name,
          points: childl1.metrics[metric].total,
          id: parseInt(childl1.id, 10),
          parentId: parseInt(initiative.id, 10)
        });

        if (childl1.children.length > 0) {
          for (let childl2 of childl1.children) {
            issues.push({
              type: childl2.fields.issuetype.name,
              key: childl2.key,
              title: childl2.fields.summary,
              state: childl2.fields.status.name,
              points: childl2.metrics[metric].total,
              id: parseInt(childl2.id, 10),
              parentId: parseInt(childl1.id, 10)
            });
          }
        }
      }
    }
  }
  return issues;
};

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Table: FC<connectedProps> = ({ defaultPoints, roadmap }) => {
  const classes = useStyles();
  let metric = "points";
  if (!defaultPoints) {
    metric = "issues";
  }

  if (Object.values(roadmap).length > 0) {
    const issues: any = flattenData(roadmap.byInitiative, metric);
    return (
      <Paper className={classes.root}>
        <Typography variant="h5" component="h3">
          Initiatives Completion
        </Typography>
        <Typography component="p">Displaying values in {metric}</Typography>
        <MaterialTable
          columns={[
            { title: "Type", field: "type", cellStyle: { width: 80 } },
            { title: "Key", field: "key", cellStyle: { width: 200 } },
            { title: "Title", field: "title" },
            { title: "State", field: "state", cellStyle: { width: 80 } },
            {
              title: "Points",
              field: "points",
              type: "numeric",
              cellStyle: { width: 80 }
            }
          ]}
          data={issues}
          parentChildData={(row: any, rows: any) =>
            rows.find((a: any) => a.id === row.parentId)
          }
          title={""}
        />
      </Paper>
    );
  } else {
    return null;
  }
};

export default connect(
  mapState,
  mapDispatch
)(Table);
