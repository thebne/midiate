from ..base import AppBase
from ..utils import midi_to_note
from core.output.types import OutputType


class CurrentNotes(AppBase):
    output_type = OutputType.Background

    def __init__(self):
        super().__init__()
        self._currently_playing = set()

    async def on_event(self, event):
        if event.type == 'note_on':
            self._currently_playing.add(event.note)
        elif event.type == 'note_off' and event.note in self._currently_playing:
            self._currently_playing.remove(event.note)

    @property
    def current_notes(self):
        return [midi_to_note(n)[:-1] for n in sorted(self._currently_playing)]

