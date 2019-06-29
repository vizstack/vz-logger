import { createSelector } from 'reselect';
import { ImmutableObject, ImmutableArray } from 'seamless-immutable';

import { AppState } from '..';
import { DashboardState } from './model';


/* Root state slice selector. */
function rootSelector(state: AppState): DashboardState {
    return state.dashboard;
}

/**
 * Get example data.
 * @param state
 * @returns Data stored in state.
 */
export function recordsFactory() {
    const getAllRecords = (state: AppState) => rootSelector(state).allRecords;
    const getRecordsTable = (state: AppState) => rootSelector(state).records;
    return createSelector(
        getAllRecords,
        getRecordsTable,
        (allRecords, recordsTable) => allRecords.map((recordId) => recordsTable[recordId]),
    );
}