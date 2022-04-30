import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../store';
import LinearProgress from '@mui/material/LinearProgress';

export default function LoadingBar() {
  const globalLoading = useSelector((state: RootState) => state.global.loading);

  if (globalLoading) {
    return <LinearProgress color="secondary" />;
  }
  return null;
}
