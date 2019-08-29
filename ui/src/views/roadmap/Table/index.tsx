import Grid, { GridSpacing } from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import MaterialTable from "material-table";
import ProgressBar from "react-bootstrap/ProgressBar";
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

const getProgress = (issue: any, metric: string) => {
  let progressPrct = 0;
  let missing = "";
  if (issue.metrics[metric].missing > 0) {
    missing =
      " (" + issue.metrics[metric].missing + " open issues without estimate)";
  }
  if (issue.metrics[metric].total > 0) {
    progressPrct =
      Math.round(
        ((issue.metrics[metric].completed * 100) /
          issue.metrics[metric].total) *
          10
      ) / 10;
  }
  return {
    completed: issue.metrics[metric].completed,
    total: issue.metrics[metric].total,
    progress: progressPrct
  };
};

const getMissingEffort = (issue: any) => {
  let missing = "";
  if (issue.metrics.points.missing > 0) {
    missing = issue.metrics.points.missing;
  }
  return missing;
};

const getPayload = (issue: any, metric: string) => {
  return {
    type: issue.fields.issuetype.name,
    key: issue.key,
    title: issue.fields.summary,
    state: issue.fields.status.name,
    progress: getProgress(issue, metric),
    missingEffort: getMissingEffort(issue),
    missingPoints: issue.metrics.missingPoints,
    id: parseInt(issue.id, 10)
  };
};

const getBarVariant = (payload: any) => {
  if (payload.progress.progress === 100) {
    return "success";
  } else if (payload.progress.progress === 100 && payload.missingEffort > 0) {
    return "warning";
  }
  return undefined;
};

const flattenData = (initiatives: any, metric: string) => {
  const issues = [];
  for (let initiative of initiatives) {
    issues.push(getPayload(initiative, metric));
    if (initiative.children.length > 0) {
      for (let childl1 of initiative.children) {
        issues.push({
          ...getPayload(childl1, metric),
          parentId: parseInt(initiative.id, 10)
        });

        if (childl1.children.length > 0) {
          for (let childl2 of childl1.children) {
            issues.push({
              ...getPayload(childl2, metric),
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
  console.log(roadmap);
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
              title: "Progress",
              field: "progress",
              type: "numeric",
              cellStyle: { width: 160 },
              render: rowData => {
                if (
                  rowData.state === "Done" &&
                  rowData.missingPoints === true
                ) {
                  return <span>n/a (missing but done)</span>;
                } else {
                  return (
                    <ProgressBar
                      variant={getBarVariant(rowData)}
                      now={rowData.progress.progress}
                      label={
                        <span style={{ color: "#000" }}>
                          {rowData.progress.progress}% (
                          {rowData.progress.completed}/{rowData.progress.total})
                        </span>
                      }
                    />
                  );
                }
              }
            },
            {
              title: "# Missing Estimates",
              field: "missingEffort",
              type: "numeric",
              cellStyle: { width: 120 }
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