// https://github.com/pimterry/loglevel
import * as log from 'loglevel';
import { createModel } from '@rematch/core';

export const global = createModel({
  state: {
    log: {},
    showMenu: false,
    pageTitle: null,
    defaultPoints: true
  },
  reducers: {
    setLog(state: any, payload: any) {
      return { ...state, log: payload };
    },
    setShowMenu(state: any, payload: any) {
      return { ...state, showMenu: payload };
    },
    setPageTitle(state: any, payload: any) {
      return { ...state, pageTitle: payload };
    },
    setDefaultPoints(state: any, payload: any) {
      return { ...state, defaultPoints: payload };
    }
  },
  effects: {
    async initApp() {
      const logger = log.noConflict();
      if (process.env.NODE_ENV !== 'production') {
        logger.enableAll();
      } else {
        logger.disableAll();
      }
      logger.info('Logger initialized');
      this.setLog(logger);
    }
  }
});
