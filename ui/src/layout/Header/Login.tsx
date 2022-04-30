import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import IconButton from '@mui/material/IconButton';
import { MenuItem } from '@mui/material';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';

import { RootState, Dispatch } from '../../store';

const Login = () => {
  const dispatch = useDispatch<Dispatch>();
  const authUser = useSelector((state: RootState) => state.global.authUser);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  function handleProfileMenuOpen(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  const handleLogOut = () => {
    setAnchorEl(null);
    dispatch.global.doLogOut();
  };

  if (Object.keys(authUser).length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      <IconButton
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleProfileMenuOpen}
        color="inherit"
        size="large"
      >
        <Avatar alt={authUser.name} src={authUser.picture} />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        anchorEl={anchorEl}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleLogOut}>Log-Out</MenuItem>
      </Menu>
    </React.Fragment>
  );
};

export default Login;
