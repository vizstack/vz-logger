import { Reducer } from 'redux';
import { combineReducers } from 'redux-seamless-immutable';

import * as dashboard from './dashboard';

/* Shape of store root, i.e. state produced by highest-level reducer. */
export type AppState = {
    dashboard: dashboard.DashboardState;
};

/* Highest-level reducer for store root. Simply dispatches to other reducers. */
export const appReducer: Reducer<AppState> = combineReducers({
    dashboard: dashboard.reducer,
});
