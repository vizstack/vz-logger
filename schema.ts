type LogMessage = {
    /* Number (integer) of MILLISECONDS since the Unix Epoch. Note that many standard libraries
     * return the number of SECONDS by default, so need to be converted. */
    timestamp: number,

    /* Absolute filepath of file in which the log statement was called.  */
    filepath: string,

    /* Line number in file at which the log statement was called. */
    lineno: number,

    /* Name of the logger from which the log statement was called. */
    logger: string,

    /* Log level to distinguish messages of different severity. */
    level: 'debug' | 'info' | 'warn' | 'error',

    /* Tags (string) attached to log statement, useful for filtering. */
    tags: string[],

    /* Vizstack view of the logged message and/or objects. */
    view: {},
};