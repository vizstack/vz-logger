import socket
import enum
import webbrowser
import xnode
from xnode.view import Flow
import json
from typing import Optional, Any, Iterable, Tuple
from inspect import currentframe, getframeinfo
from types import FrameType
import time


class LogLevel(enum.Enum):
    DEBUG = 0
    INFO = 1
    WARN = 2
    ERROR = 3


def start_server(ip, input_port, output_port) -> Tuple[str, int]:
    # TODO
    pass


class Logger:
    def __init__(self):
        self._socket = None
        self._log_level = None

    def start(self, server_ip: str, server_input_port: int, log_level: LogLevel=LogLevel.INFO, server_output_port: Optional[int]=None, create_server: bool=False):
        if create_server:
            assert server_output_port is not None
            start_server(server_ip, server_input_port, server_output_port)

        self._socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._socket.connect((server_ip, server_input_port))
        if server_output_port:
            webbrowser.open_new_tab('{}:{}'.format(server_ip, server_output_port))
        self._log_level = log_level

    def info(self, *objects):
        filename, lineno = self._get_file()
        self._log(LogLevel.INFO, filename, lineno, objects)

    def warn(self, *objects):
        filename, lineno = self._get_file()
        self._log(LogLevel.WARN, filename, lineno, objects)

    def error(self, *objects):
        filename, lineno = self._get_file()
        self._log(LogLevel.ERROR, filename, lineno, objects)

    def debug(self, *objects):
        filename, lineno = self._get_file()
        self._log(LogLevel.DEBUG, filename, lineno, objects)

    @staticmethod
    def _get_file():
        frame: Optional[FrameType] = currentframe()
        assert frame is not None
        frame_info = getframeinfo(frame.f_back.f_back)
        return frame_info.filename, frame_info.lineno

    def _log(self, level: LogLevel, filename: str, lineno: int, *objects: Iterable[Any]):
        if level.value < self._log_level.value:
            return
        self._socket.sendall(json.dumps({
            'filepath': filename,
            'lineno': lineno,
            'level': level.name.lower(),
            'view': xnode.assemble(Flow(*objects)),
            'timestamp': time.time(),
        }))


_LOGGERS = dict()


def get_logger(name: str):
    if name not in _LOGGERS:
        _LOGGERS[name] = Logger()
    return _LOGGERS[name]

