import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route } from 'react-router-dom';

import { createTheme, ThemeProvider } from '@mui/material/styles';

import './App.css';
import { Dispatch } from './store';

import Teams from './views/teams';
import Default from './views/default';
import Layout from './layout';

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

const theme = createTheme();

const App = () => {
  const dispatch = useDispatch<Dispatch>();
  useEffect(() => {
    dispatch.global.initApp();
  }, []);

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="teams/:teamId" element={<Teams />} />
            {/* <Route path=":teamId" element={<Teams />} />
            </Route> */}
            <Route path="*" element={<Default />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </div>
  );
};

export default App;
