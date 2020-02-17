import asyncio 

class InputBase:
    def __init__(self):
        self._queue = None

    async def process_events(self):
        raise NotImplementedError()

    async def prepare(self):
        self._queue = asyncio.Queue()

    @property
    def event_queue(self):
        return self._queue

