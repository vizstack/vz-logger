export type Record = {
    /* Number (integer) of MILLISECONDS since the Unix Epoch. Note that many standard libraries
     * return the number of SECONDS by default, which will need to be converted. */
    timestamp: number;

    /* Absolute filepath of file in which the log method was called, or "" if unavailable.  */
    filePath: string;

    /* Line number in file at which the log method was called, or -1 if unavailable. */
    lineNumber: number;

    /* Column number in file at which the log method was called, or -1 if unavailable. */
    columnNumber: number;

    /* Name of the function in which the log method was called, or "" if unavailable. */
    functionName: string;

    /* Name of the logger from which the log method was called. */
    loggerName: string;

    /* Log level to distinguish messages of different severity. */
    level: 'debug' | 'info' | 'warn' | 'error';

    /* Tags (string) attached to log record, useful for filtering. */
    tags: string[];

    /* Vizstack view of the logged message and/or objects. */
    view: {};
};

// TODO: Add call stack, code context?
