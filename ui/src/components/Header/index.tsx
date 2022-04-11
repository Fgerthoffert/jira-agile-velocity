import React, { FC } from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import SwitchPoints from './switchPoints';
import Login from './Login';
import { iRootState } from '../../store';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    appBar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    hide: {
      display: 'none',
    },
    title: {
      flexGrow: 1,
    },
  }),
);

const mapState = (state: iRootState) => ({
  showMenu: state.global.showMenu,
  pageTitle: state.global.pageTitle,
});

const mapDispatch = (dispatch: any) => ({
  setShowMenu: dispatch.global.setShowMenu,
});

type connectedProps = ReturnType<typeof mapState> &
  ReturnType<typeof mapDispatch>;

const Header: FC<connectedProps> = ({ setShowMenu, showMenu, pageTitle }) => {
  const handleDrawerOpen = () => {
    setShowMenu(true);
  };

  const classes = useStyles();

  return (
    <AppBar
      position="fixed"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: showMenu,
      })}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          className={clsx(classes.menuButton, showMenu && classes.hide)}
          size="large"
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap className={classes.title}>
          {pageTitle}
        </Typography>
        <SwitchPoints />
        {JSON.parse(window._env_.AUTH0_DISABLED) !== true && <Login />}
      </Toolbar>
    </AppBar>
  );
};

export default connect(mapState, mapDispatch)(Header);
