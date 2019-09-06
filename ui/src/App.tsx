// tslint:disable-next-line: file-name-casing
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';
import RedirectVelocity from './components/RedirectVelocity';
import Roadmap from './views/roadmap';
import Velocity from './views/velocity';

const App: React.FC = () => {
  return (
    <div className='App'>
      <Router>
        <Switch>
          <Route exact name='index' path='/' component={RedirectVelocity} />
          <Route exact path='/velocity' component={Velocity} />
          <Route exact path='/initiatives' component={Roadmap} />
        </Switch>
      </Router>
    </div>
  );
};

export default App;
