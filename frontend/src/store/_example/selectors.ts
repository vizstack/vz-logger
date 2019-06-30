import { createSelector } from 'reselect';
import { ImmutableObject, ImmutableArray } from 'seamless-immutable';

import { AppState } from '..';
import { ExampleState } from './model';

// /* Root state slice selector. */
// function rootSelector(state: AppState): ExampleState {
//     return state.example;
// }

// /**
//  * Get example data.
//  * @param state
//  * @returns Data stored in state.
//  */
// export function exampleDataFactory() {
//     return createSelector(
//         rootSelector,
//         (state: ExampleState) => state.data,
//     );
// }
