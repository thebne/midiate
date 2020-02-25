from collections import deque
import time
import asyncio
import mido
import time

from .base import InputBase
from ..events import MidiEvent

class MidiInput(InputBase):
    def __init__(self, name):
        super().__init__()
        self._device_name = self._get_full_name(name)
        self._port = None


    async def prepare(self):
        await super().prepare()
        self._port = mido.open_input(self._device_name)
        self._time = self._itertime()

    @staticmethod
    def _itertime():
        prev = time.time()
        yield 0
        while True:
            current = time.time()
            yield mido.second2tick(current - prev, 480, 500000)
            prev = current

    @staticmethod
    def _get_full_name(name):
        options = [n for n in mido.get_input_names() if name in n]
        if not len(options):
            raise RuntimeError(f"Couldn't find MIDI input that has {name} in it")

        return options[0]

    async def process_events(self):
        for e in self._port.iter_pending():
            # TODO this is an ugly solution because of many reasons (time deviation, consts, etc.). Understand how to do it well...
            e.time = int(next(self._time))
            await self._queue.put(MidiEvent(e))


