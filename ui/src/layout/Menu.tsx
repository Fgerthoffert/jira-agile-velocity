import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Link, LinkProps } from 'react-router-dom';

import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';

import { RootState } from '../store';

// eslint-disable-next-line react/display-name
const AdapterLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => <Link {...props} />,
);

interface Props {
  closeDrawer: () => void;
}

const Menu: FC<Props> = ({ closeDrawer }) => {
  const teams = useSelector((state: RootState) => state.global.teams);

  const routes = [
    ...teams.map((t: any) => {
      return {
        path: `/teams/${t.id}`,
        icon: <PeopleIcon />,
        text: t.name,
      };
    }),
  ];

  return (
    <>
      <List>
        {routes.map((route) => {
          return (
            <ListItem
              key={route.text}
              component={AdapterLink}
              to={route.path}
              onClick={() => {
                closeDrawer();
              }}
            >
              <ListItemIcon>{route.icon}</ListItemIcon>
              <ListItemText primary={route.text} />
            </ListItem>
          );
        })}
      </List>
    </>
  );
};

export default Menu;
