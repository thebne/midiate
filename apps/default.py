import time
from collections import deque

from .recorder import RecorderApp
from .features import UseFeature
from .features.buttons import Buttons

from core.events import AppEvent, MidiEvent, EventType
from core import Manager


from .base import AppBase
from .chord import ChordApp
from .sine import SineWaveApp
APPS = (ChordApp, RecorderApp, SineWaveApp)


"""
Default app takes care of MIDI keyboard management
"""
@UseFeature(Buttons)
class DefaultApp(AppBase):
    def __init__(self):
        super().__init__()
        # TODO use CurrentNotes feature instead, keep track of last state
        self._signal_queue = deque(maxlen=4)
        self._signal_found_notes = None
        self._signal_start_time = None

        self._locked = False

    async def on_event(self, event):
        if isinstance(event, MidiEvent) and event.type in ('note_on', 'note_off'):
            self._signal_queue.append(event.value)
            await self._process_signals()

        elif isinstance(event, AppEvent) and event.value == EventType.LOCK:
            raise RuntimeError("Lock feature not supported yet")

    def get_buttons(self):
        buttons = {}
        for app in APPS:
            def make_fn(app):
                async def start():
                    await Manager().open_app(app)
                return start
                
            buttons[app.__name__] = make_fn(app)

        return buttons

    async def _process_signals(self):
        notes = [x.note for x in self._signal_queue]

        # look for signal: base note, base note + 1, base note + >= 60, base note + >= 61
        if self._signal_start_time is not None:
            # notes were on and now all of them are off (ending sequence)
            if set(notes).issubset(self._signal_found_notes):
                if all([x.type == 'note_off' for x in self._signal_queue]):
                    # check that enough time had passed
                    time_passed = time.time() - self._signal_start_time
                    print('Time passed:', time_passed)
                    if time_passed >= 3:
                        print('sending event')
                        await Manager().fire_event(AppEvent(EventType.LOCK))
                    elif not self._locked:
                        await Manager().fire_event(AppEvent(EventType.ENTER))
                    self._signal_found_notes = None
                    self._signal_start_time = None
            else:
                self._signal_found_notes = None
                self._signal_start_time = None
            return

        # only process special notes if not locked
        if not self._locked:
            notes_with_type = set([(x.note, x.type) for x in self._signal_queue])
            min_note = min(notes)
            max_note = max(notes)
            if min_note <= 40 and min_note + 1 in notes:
                if set(((min_note, 'note_off'), (min_note, 'note_on'),
                        (min_note + 1, 'note_off'), (min_note + 1, 'note_on'))) == notes_with_type:
                    return await Manager().fire_event(AppEvent(EventType.LEFT))
            if max_note >= 100 and max_note - 1 in notes:
                if set(((max_note, 'note_off'), (max_note, 'note_on'),
                        (max_note -1, 'note_off'), (max_note - 1, 'note_on'))) == notes_with_type:
                    return await Manager().fire_event(AppEvent(EventType.RIGHT))


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


if __name__ == '__main__':
    main()
