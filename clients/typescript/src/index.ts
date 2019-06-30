import { URL } from 'url';
import socketio from 'socket.io-client';
import stacktrace from 'stacktrace-js';

import { assemble, Flow } from 'vizstack';

// SocketIO Client used to send log records to the server.
let _client: SocketIOClient.Socket | null = null;

export function connect(url: string = 'http://localhost:4000'): void {
    disconnect();
    _client = socketio((new URL('/program', url)).href);
}

export function disconnect(): void {
    if(_client !== null) {
        _client.disconnect();
        _client = null;
    }
}

// Log levels to distinguish messages of different severity.
enum LogLevel {
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
}
export const DEBUG = LogLevel.DEBUG;
export const INFO = LogLevel.INFO;
export const WARN = LogLevel.WARN;
export const ERROR = LogLevel.ERROR;

export class Logger {
    private _name: string;
    private _level: LogLevel;
    private _enabled: boolean;
    private _tags: string[];
    private _console: boolean;

    constructor(name: string) {
        this._name = name;
        this._level = LogLevel.INFO;
        this._enabled = true;
        this._tags = [];
        this._console = false;
    }

    // ==============================================================================================
    // Logger configuration.

    /**
     * Sets the least severe records to log.
     * @param level
     */
    public level(level: LogLevel = LogLevel.INFO): Logger {
        this._level = level;
        return this;
    }

    /**
     * Sets if logger should log any records.
     * @param enabled
     */
    public enabled(enabled: boolean = true): Logger {
        this._enabled = enabled;
        return this;
    }

    /**
     * Sets default tags to attach to log records.
     * @param tags
     */
    public tags(...tags: string[]): Logger {
        this._tags = tags;
        return this;
    }

    /**
     * Sets if log records should be echoed to console.
     * @param enabled
     */
    public console(enabled: boolean = true): Logger {
        this._console = enabled;
        return this;
    }

    // ==============================================================================================
    // Logging functions.

    public debug(...objects: any[]): void {
        // TODO: Add msg and tags.
        this._log(LogLevel.DEBUG, objects, "", []);
    }

    public info(...objects: any[]): void {
        this._log(LogLevel.INFO, objects, "", []);
    }

    public warn(...objects: any[]): void {
        this._log(LogLevel.WARN, objects, "", []);
    }

    public error(...objects: any[]): void {
        this._log(LogLevel.ERROR, objects, "", []);
    }

    // ==============================================================================================
    // Behind-the-scenes.

    private async _log(level: LogLevel, objects: any[], msg: string, tags: string[]) {
        // No logging when globally or selectively disabled.
        if(!this._enabled) return;
        if(level < this._level) return;

        // Get time before async stack generation.
        const timestamp: number = (new Date()).getTime();

        // Get information about code context.
        let filePath: string = "";
        let lineNumber: number = -1;
        let columnNumber: number = -1;
        let functionName: string = "";
        try {
            const frames = await stacktrace.get({ offline: true });
            // Index in the stack frame array in which the calling method is located. As it is
            // determined by this code's implementation, it needs to be updated after a refactor.
            const kStackIdx: number = 5;
            if(frames && frames[kStackIdx]) {
                const f = frames[kStackIdx];
                filePath = f.fileName;
                lineNumber = f.lineNumber;
                columnNumber = f.columnNumber;
                functionName = f.functionName;
            }
        } catch(err) {}

        // Echo to console, if set.
        if(this._console && console) {
            switch(level) {
                case LogLevel.DEBUG: console.debug(...objects); break;
                case LogLevel.INFO: console.info(...objects); break;
                case LogLevel.WARN: console.warn(...objects); break;
                case LogLevel.ERROR: console.error(...objects); break;
            }
        }

        const record: string = JSON.stringify({
            timestamp,
            filePath,
            lineNumber,
            columnNumber,
            functionName,
            loggerName: this._name,
            level: LogLevel[level].toLowerCase(),
            tags: [...this._tags, ...tags],
            view: assemble(Flow(...objects)),
        });

        console.log(record);  // TODO: Remove when figured out how to test properly.

        if(_client !== null) {
            _client.emit('ProgramToServer', record);
        }
    }
}

// Map from names to the Logger objects, so that Loggers can be recycled.
const _loggers: Map<string, Logger> = new Map();

/**
 * Returns the Logger associated with the given name, creating it if it does not already exist.
 * @param name
 */
export function getLogger(name: string): Logger {
    name = "" + name;
    let logger = _loggers.get(name);
    if(logger !== undefined) return logger;
    logger = new Logger(name);
    _loggers.set(name, logger);
    return logger;
}
