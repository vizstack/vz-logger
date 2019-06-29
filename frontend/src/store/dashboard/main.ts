import { Dispatch } from 'redux';
import Immutable, { ImmutableObject, ImmutableArray } from 'seamless-immutable';
import cuid from 'cuid';

import { DashboardState, RecordId, Tag } from './model';
import { Record } from '../../schema';


/* Root reducer's initial state slice. */
const initialState: DashboardState = Immutable({
    records: {},
    allRecords: [],
    pinnedRecords: [],
    pageSize: 50,
    levelFilter: {
        debug: false,
        info: true,
        warn: true,
        error: true,
    },
    tagFilter: [],
    timeFilter: {
        start: null,
        end: null,
    }
});

/* All actions handled by the root reducer. */
type DashboardAction = AddRecord;

/**
 * Root reducer for state related to ____.
 * @param state
 * @param action
 */
export default function rootReducer(
    state: DashboardState = initialState,
    action: DashboardAction,
): DashboardState {
    switch (action.type) {
        case 'dashboard/AddRecord':
            return addRecordReducer(state, action);
        default:
            return state; // No effect by default.
    }
}

// =================================================================================================

type AddRecord = { type: 'dashboard/AddRecord'; record: Record; id: RecordId };

/**
 * Add a new logger record to the list, maintaining chronological order.
 * @param value
 * @returns An action object.
 */
export function addRecordAction(record: Record): AddRecord {
    return {
        type: 'dashboard/AddRecord',
        record,
        id: `${record.timestamp}${cuid.slug()}`,
    };
}

function addRecordReducer(state: DashboardState, action: AddRecord): DashboardState {
    // Scan backwards until `idx` points to the index at which the given record should be inserted,
    // i.e., all records before `idx` were created no later than the given record.
    const { record, id } = action;
    let idx: number = state.allRecords.length;
    while(idx > 0) {
        const prevId = state.allRecords[idx-1];
        const prevRecord = state.records[prevId];
        if(prevRecord && prevRecord.timestamp <= record.timestamp) break;
        idx--;
    }
    return (state
        .setIn(['records', id], record)
        .update('allRecords', (allRecords: any) => {
            const arr = allRecords.asMutable();
            arr.splice(idx, 0, id);
            return arr;
        }));
}

// =================================================================================================

type ClearAllRecords = { type: 'dashboard/ClearAllRecords' };

/**
 * Clear all records that have been added until now.
 * @param value
 * @returns An action object.
 */
export function clearAllRecordsAction(): ClearAllRecords {
    return {
        type: 'dashboard/ClearAllRecords',
    };
}

function clearAllRecordsReducer(state: DashboardState, action: ClearAllRecords): DashboardState {
    // TODO
    return state;
}
