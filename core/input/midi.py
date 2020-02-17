import asyncio
import mido

from .base import InputBase

class MidiInput(InputBase):
    def __init__(self, name):
        super().__init__()
        self._device_name = self._get_full_name(name)
        self._port = None

    async def prepare(self):
        await super().prepare()
        self._port = mido.open_input(self._device_name)

    @staticmethod
    def _get_full_name(name):
        return [n for n in mido.get_input_names() if name in n][0]

    async def process_events(self):
        for e in self._port.iter_pending():
            await self._queue.put(e)
