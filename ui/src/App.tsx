// tslint:disable-next-line: file-name-casing
import React, { FC } from 'react';
import { connect } from 'react-redux';
import {
  ThemeProvider,
  Theme,
  StyledEngineProvider,
  createTheme,
} from '@mui/material/styles';
import '@mui/styles';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';
import Teams from './views/teams';
import Default from './views/default';

declare module '@mui/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const mapDispatch = (dispatch: any) => ({
  initApp: dispatch.global.initApp,
});

const theme = createTheme();

type connectedProps = ReturnType<typeof mapDispatch>;

const App: FC<connectedProps> = ({ initApp }) => {
  initApp();
  return (
    <div className="App">
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Router>
            <Switch>
              <Route exact path="/" render={() => <Default />} />
              <Route exact path="/teams" render={() => <Teams />} />
              <Route exact path="/teams/:teamId" render={() => <Teams />} />
              <Route
                exact
                path="/teams/:teamId/:tab"
                render={() => <Teams />}
              />
            </Switch>
          </Router>
        </ThemeProvider>
      </StyledEngineProvider>
    </div>
  );
};

export default connect(null, mapDispatch)(App);
