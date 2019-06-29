import { Dispatch } from 'redux';
import Immutable, { ImmutableObject, ImmutableArray } from 'seamless-immutable';

import { ExampleState } from './model';


/* Root reducer's initial state slice. */
const initialState: ExampleState = Immutable({
    data: 0,
});

/* All actions handled by the root reducer. */
type ExampleAction = Action1;

/**
 * Root reducer for state related to ____.
 * @param state
 * @param action
 */
export default function rootReducer(
    state: ExampleState = initialState,
    action: ExampleAction,
): ExampleState {
    switch (action.type) {
        case 'example/Action1':
            return syncReducer(state, action);
        default:
            return state; // No effect by default.
    }
}

// =================================================================================================

type Action1 = { type: 'example/Action1'; value: number };

/**
 * Description.
 * @param value
 * @returns An action object.
 */
export function syncAction(value: number): Action1 {
    // Must take form of `[name]Action`
    return {
        type: 'example/Action1',
        value,
    };
}

function syncReducer(state: ExampleState, action: Action1): ExampleState {
    return state.set('data', action.value);
}

// =================================================================================================

/**
 * Description.
 * @param value
 * @returns An action thunk.
 */
export function asyncAction(value: number) {
    return async (dispatch: Dispatch, getState: () => ExampleState) => {
        let noDispatchCondition = getState().data === 0;
        if (noDispatchCondition) {
            return;
        }
        try {
            const serverValue = await dummyAPICall(value);
            dispatch(syncAction(serverValue));
        } catch (error) {
            console.log(error);
        }
    };
}

async function dummyAPICall(value: number) {
    return Promise.resolve(value);
}

// import { handle } from 'redux-pack';
// function asyncReducer(state, action) {
//     return handle(state, action, {
//         start: (state) => ({ ...state }),
//         finish: (state) => ({ ...state }),
//         failure: (state) => ({ ...state }),
//         success: (state) => ({ ...state }),
//     });
// }
