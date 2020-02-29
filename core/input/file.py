import time
import asyncio
import mido

from .base import InputBase
from ..events import MidiEvent

class MidiFileInput(InputBase):
    def __init__(self, path):
        super().__init__()
        self._file = mido.MidiFile(path)

    async def prepare(self):
        await super().prepare()
        asyncio.create_task(self._read_from_file())

    async def _read_from_file(self):
        for msg in self._file:
            await asyncio.sleep(msg.time)
            if not msg.is_meta:
                await self._queue.put(MidiEvent(msg))
