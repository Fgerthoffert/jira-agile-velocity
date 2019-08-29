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
  console.log(velocity);
  return <VelocityChart velocity={velocity} defaultPoints={defaultPoints} />;
}
