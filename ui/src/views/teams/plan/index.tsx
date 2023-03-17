import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import Review from './review';
import CompletionDetails from './completionDetails';
import Forecast from './forecast';

const Plan = () => {
  return (
    <>
      <Review />
      <CompletionDetails />
      <Forecast />
    </>
  );
};

export default Plan;
