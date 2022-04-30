import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import Layout from '../../layout';

import { RootState } from '../../store';

const Default = () => {
  const loggedIn = useSelector((state: RootState) => state.global.loggedIn);

  if (loggedIn) {
    return <Navigate to="/teams" />;
  }

  return (
    <Layout>
      <span>{''}</span>
    </Layout>
  );
};

export default Default;
