import React from "react";
import clsx from "clsx";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import VelocityChart from "../../../components/Charts/ChartJS/VelocityChart";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex"
    }
  })
);

export interface WeeklyChartsProps {
  velocity: any;
  defaultPoints: any;
}

export default function WeeklyChart(props: WeeklyChartsProps) {
  const classes = useStyles();
  const [open] = React.useState(false);
  const { velocity, defaultPoints } = props;

  const itemsToDisplay = 16;
  const startPos =
    itemsToDisplay > velocity.weeks.length
      ? 0
      : velocity.weeks.length - itemsToDisplay;

  const dataset = velocity.weeks
    .slice(startPos, velocity.weeks.length)
    .map((week: any) => {
      return {
        ...week,
        legend: week.weekTxt
      };
    });

  console.log(velocity);
  return <VelocityChart dataset={dataset} defaultPoints={defaultPoints} />;
}
