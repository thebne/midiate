import asyncio
import mido

from .base import InputBase

class MidiInput(InputBase):
    def __init__(self, name):
        self._device_name = self._get_full_name(name)

        # create a callback/stream pair and pass callback to mido
        cb, self._stream = self._make_stream()
        mido.open_input(self._device_name, callback=cb)

    # from https://stackoverflow.com/questions/56277440/how-can-i-integrate-python-mido-and-asyncio
    @staticmethod
    def _make_stream():
        loop = asyncio.get_event_loop()
        queue = asyncio.Queue()
        def callback(message):
            loop.call_soon_threadsafe(queue.put_nowait, message)
        async def stream():
            while True:
                yield queue.get()
        return callback, stream()

    @staticmethod
    def _get_full_name(name):
        return [n for n in mido.get_input_names() if name in n][0]

    async def get_next_event(self):
        # send messages as they come just by reading from stream
        async for message in self._stream:
            yield await message

