type LogMessage = {
    timestamp: number,
    filepath: string,
    lineno: number,
    level: 'debug' | 'info' | 'warn' | 'error',
    view: {},
    logger: string,
    tags: string[],
};