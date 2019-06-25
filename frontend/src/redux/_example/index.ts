export { default } from './_example';
export * from './_example';

// TODO: If don't need to further break up state slice into hierarchy, just use the code above and
// delete the code below. Else, delete the first `export default` and add the following.

// import { combineReducers } from 'redux-seamless-immutable';
// import exampleReducer from './_example';
// import subexampleReducer from './subexample';
//
// export default combineReducers({
//     example:    exampleReducer,
//     subexample: subexampleReducer,
// });
