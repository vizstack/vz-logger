import { ImmutableObject, ImmutableArray } from 'seamless-immutable';

import { Record } from '../../schema';

/* Root reducer's state slice type. */
export type DashboardState = ImmutableObject<{
    // Map from id to records.
    records: {
        [key: string]: Record;
    };

    // List of log records, sorted by timestamp from earliest to latest.
    allRecords: RecordId[];

    // List of pinned log records, in the order that they were pinned.
    pinnedRecords: RecordId[];

    // Number of (non-pinned) records to display on a page at once.
    pageSize: 50 | 100 | 150 | 200;

    // Filter by log level.
    levelFilter: {
        debug: boolean;
        info: boolean;
        warn: boolean;
        error: boolean;
    };

    // Filter by tag.
    tagFilter: Tag[];

    // Filter by time.
    timeFilter: {
        start: number | null;
        end: number | null;
    };
}>;

/* Unique identifier for a particular log record, constructed as [timestamp][slug]. */
export type RecordId = string;

/* Metadata attached to log records for semantic annotation and filtering purposes. */
export type Tag = { key: string; value?: string };
