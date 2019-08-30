import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import './App.css';

import Velocity from './views/velocity';
import Roadmap from './views/roadmap';

const App: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route
            exact
            name="index"
            path="/"
            component={() => <Redirect to="/velocity" />}
          />
          <Route exact path="/velocity" component={Velocity} />
          <Route exact path="/roadmap" component={Roadmap} />
        </Switch>
      </Router>
    </div>
  );
};

export default App;
