import { combineReducers } from 'redux-seamless-immutable';
import exampleReducer from './_example';

/** Highest-level reducer for store root. Simply dispatches to other reducers. */
export default combineReducers({
    example: exampleReducer,
});
