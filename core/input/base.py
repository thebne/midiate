import asyncio 

class InputBase:
    def __init__(self):
        self._queue = None
        self._signal = None

    async def process_events(self):
        raise NotImplementedError()

    async def prepare(self):
        self._queue = asyncio.Queue()
        self._signal = asyncio.Event()

    @property
    def event_queue(self):
        return self._queue

    def signal_set(self):
        # read and reset
        ret = self._signal.is_set()
        self._signal.clear()
        return ret
