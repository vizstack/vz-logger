import socket
import enum
import webbrowser
import sys
import json
import time
import threading
from typing import Optional, Any, Tuple, Mapping, Sequence
from inspect import currentframe, getframeinfo
from types import FrameType

from vizstack.core import assemble, Flow


# TODO: Locking, exceptions, msgs?
# logger.log(Msg("hello"))  --> string label
# logger.log(Msg("hello", 1))  --> named value
# logger.log(Msg("hello", 1, 2))  --> named tuple
# logger.log(Msg("Hello {} there {}", 1, 2))  --> formatted flow 
# logger.logx("Hello {} there {}", 1, 2)
# logger.infox(), logger.debugx(), logger.warnx(), logger.errorx()
# TODO: Optimize for speed (binary format like Protobuf)
# TODO: How to make logx aligned so printing, e.g. tabular format. Don't want to reimplement,
# so do View assembly on frontend.
# TODO: Want machine parsable format to be extractable.


# Log levels to distinguish messages of different severity.
DEBUG = 1
INFO = 2
WARN = 3
ERROR = 4

_level_to_name = { DEBUG: 'debug', INFO: 'info', WARN: 'warn', ERROR: 'error' }

class Logger:
    def __init__(self, name: str):
        self._name = name
        self._level = INFO
        self._enabled = True
        self._tags = []
        self._stdout = False
        self._stderr = False

        # TODO: open a socket, retries on fail, retry every 1 second until connect
        self._socket = None  # TODO


    # ==============================================================================================
    # Logger configuration.

    def level(self, level: int = INFO) -> 'Logger':
        """Sets the least severe records to log."""
        self._level = level
        return self

    def enabled(self, enabled: bool = True) -> 'Logger':
        """Sets if logger should log any records."""
        self._enabled = enabled
        return self

    def tags(self, *tags: Sequence[str]) -> 'Logger':
        """Sets default tags to attach to log records."""
        print(tags)
        self._tags = tags
        return self

    def stdout(self, enabled: bool = True) -> 'Logger':
        """Sets if log records should be echoed to stdout."""
        self._stdout = enabled
        return self
    
    def stderr(self, enabled: bool = True) -> 'Logger':
        """Sets if log records should be echoed to stderr."""
        self._stderr = enabled
        return self


    # ==============================================================================================
    # Logging functions.

    def debug(self, *objects, msg: str = "", tags: Sequence[str] = []):
        self._log(DEBUG, objects, msg, tags)

    def info(self, *objects, msg: str = "", tags: Sequence[str] = []):
        self._log(INFO, objects, msg, tags)

    def warn(self, *objects, msg: str = "", tags: Sequence[str] = []):
        self._log(WARN, objects, msg, tags)

    def error(self, *objects, msg: str = "", tags: Sequence[str] = []):
        self._log(ERROR, objects, msg, tags)


    # ==============================================================================================
    # Behind-the-scenes.

    def _log(self, level: int, objects: Sequence[Any], msg: str, tags: Sequence[str]):
        # No logging when globally or selectively disabled.
        if not self._enabled: return
        if level < self._level: return

        # Get information about code context.
        frame: Optional[FrameType] = currentframe()
        filepath, lineno = "", 0
        if frame is not None:
            frame_info = getframeinfo(frame.f_back.f_back)
            filepath = frame_info.filename
            lineno = frame_info.lineno
        
        # Echo to standard out/err, if configured.
        if self._stdout: print(*objects, file=sys.stdout)
        if self._stderr: print(*objects, file=sys.stderr)
        
        msg: str = json.dumps({
            'timestamp': int(time.time() * 1000),  # Convert to milliseconds.
            'filepath': filepath,
            'lineno': lineno,
            'logger': self._name,
            'level': _level_to_name[level],
            'tags': self._tags,
            'view': assemble(Flow(*objects)),
        })

        # TODO: Add error handling
        # self._socket.sendall()

_lock = threading.RLock()
_loggers: Mapping[str, Logger] = dict()

def get_logger(name: str) -> Logger:
    name = str(name)
    _lock.acquire()
    if name not in _loggers:
        _loggers[name] = Logger(name)
    logger = _loggers[name]
    _lock.release()
    return logger