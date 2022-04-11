import React, { FC } from 'react';
import { connect } from 'react-redux';
import { useTheme, Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link, LinkProps } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { iRootState } from '../../store';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    noLink: {},
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
  }),
);

const mapState = (state: iRootState) => ({
  showMenu: state.global.showMenu,
  teams: state.global.teams,
});

const mapDispatch = (dispatch: any) => ({
  setShowMenu: dispatch.global.setShowMenu,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

// eslint-disable-next-line react/display-name
const AdapterLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => <Link innerRef={ref as any} {...props} />,
);

const Menu: FC<connectedProps> = ({ setShowMenu, showMenu, teams }) => {
  const handleDrawerClose = () => {
    setShowMenu(false);
    return undefined;
  };

  const classes = useStyles();
  const theme = useTheme();

  const routes = [
    ...teams.map((t: any) => {
      return {
        path: `/teams/${t.id}`,
        icon: <PeopleIcon />,
        text: t.name,
      };
    }),
    {
      path: '/velocity',
      icon: <BarChartIcon />,
      text: 'Velocity',
    },
    {
      path: '/control',
      icon: <BarChartIcon />,
      text: 'Control Chart',
    },
    {
      path: '/initiatives',
      icon: <FormatListNumberedIcon />,
      text: 'Initiatives',
    },
  ];

  return (
    <Drawer
      className={classes.drawer}
      open={showMenu}
      onClose={handleDrawerClose}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div
        className={classes.drawerHeader}
        role="presentation"
        onClick={handleDrawerClose}
        onKeyDown={handleDrawerClose}
      >
        <IconButton onClick={handleDrawerClose} size="large">
          {theme.direction === 'ltr' ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </div>
      <Divider />
      <List>
        {routes.map((route) => {
          return (
            <ListItem key={route.text} component={AdapterLink} to={route.path}>
              <ListItemIcon>{route.icon}</ListItemIcon>
              <ListItemText primary={route.text} />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default connect(mapState, mapDispatch)(Menu);
