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
  const itemsToDisplay = 40;
  const startPos =
    itemsToDisplay > velocity.days.length
      ? 0
      : velocity.days.length - itemsToDisplay;
  const dataset = velocity.days
    .slice(startPos, velocity.days.length)
    .map((day: any) => {
      return {
        ...day,
        legend: day.date.slice(5, 10)
      };
    });

  return <VelocityChart dataset={dataset} defaultPoints={defaultPoints} />;
}
