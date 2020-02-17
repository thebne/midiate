from collections import deque
import time
import asyncio
import mido

from .base import InputBase

class MidiInput(InputBase):
    def __init__(self, name):
        super().__init__()
        self._device_name = self._get_full_name(name)
        self._port = None

        self._signal_queue = deque(maxlen=4)
        self._signal_found_notes = None
        self._signal_start_time = None

    async def prepare(self):
        await super().prepare()
        self._port = mido.open_input(self._device_name)

    @staticmethod
    def _get_full_name(name):
        return [n for n in mido.get_input_names() if name in n][0]

    async def process_events(self):
        for e in self._port.iter_pending():
            await self._queue.put(e)

            self._signal_queue.append(e)
            self._process_signals()

    def _process_signals(self):
        # look for signal: base note, base note + 1, base note + >= 60, base note + >= 61
        notes = [x.note for x in self._signal_queue]

        if self._signal_start_time is not None:
            # notes were on and now all of them are off (ending sequence)
            if set(notes).issubset(self._signal_found_notes):
                if all([x.type == 'note_off' for x in self._signal_queue]):
                    # check that enough time had passed
                    time_passed = time.time() - self._signal_start_time
                    print('Time passed:', time_passed)
                    if time_passed >= 2:
                        print('setting signal')
                        self._signal.set()
                    else:
                        self._signal_found_notes = None
                        self._signal_start_time = None
            else:
                self._signal_found_notes = None
                self._signal_start_time = None
            return

        # all notes are on (beginning sequence)
        if not all([x.type == 'note_on' for x in self._signal_queue]):
            return

        lower = min(notes)
        if lower + 1 not in notes:
            return

        higher = max(notes)
        if higher - 1 not in notes:
            return

        if lower + 60 > higher - 1:
            return

        # mark start
        self._signal_start_time = time.time()
        self._signal_found_notes = set(notes)

