import React, { FC } from 'react';
import { connect } from 'react-redux';
import {
  makeStyles,
  useTheme,
  Theme,
  createStyles,
} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Link, LinkProps } from 'react-router-dom';
import BarChartIcon from '@material-ui/icons/BarChart';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
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
});

const mapDispatch = (dispatch: any) => ({
  setShowMenu: dispatch.global.setShowMenu,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const AdapterLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => <Link innerRef={ref as any} {...props} />,
);

const Menu: FC<connectedProps> = ({ setShowMenu, showMenu }) => {
  const handleDrawerClose = () => {
    setShowMenu(false);
    return undefined;
  };

  const classes = useStyles();
  const theme = useTheme();

  const routes = [
    {
      path: '/velocity',
      icon: <BarChartIcon />,
      text: 'Velocity',
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
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'ltr' ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </div>
      <Divider />
      <List>
        {routes.map(route => {
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

export default connect(
  mapState,
  mapDispatch,
)(Menu);
