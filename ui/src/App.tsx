// tslint:disable-next-line: file-name-casing
import React, { FC } from 'react';
import { connect } from 'react-redux';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';
import Roadmap from './views/roadmap';
import Velocity from './views/velocity';
import Control from './views/control';
import Default from './views/default';

const mapDispatch = (dispatch: any) => ({
  initApp: dispatch.global.initApp
});

type connectedProps = ReturnType<typeof mapDispatch>;

const App: FC<connectedProps> = ({ initApp }) => {
  initApp();
  return (
    <div className='App'>
      <Router>
        <Switch>
          <Route exact name='index' path='/' component={Default} />
          <Route exact path='/velocity' component={Velocity} />
          <Route exact path='/velocity/:tab' component={Velocity} />
          <Route exact path='/control' component={Control} />
          <Route exact path='/control/:tab' component={Control} />          
          <Route exact path='/initiatives' component={Roadmap} />
        </Switch>
      </Router>
    </div>
  );
};

export default connect(
  null,
  mapDispatch
)(App);
