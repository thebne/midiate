from ..base import AppFeature
from ..utils import midi_to_note
from core.output.types import OutputType
from core.events import MidiEvent


class CurrentNotes(AppFeature):
    output_type = OutputType.Background

    def __init__(self, instance):
        super().__init__(instance)
        self._currently_playing = set()

    async def on_event(self, event):
        if not isinstance(event, MidiEvent):
            return

        if event.type == 'note_on':
            self._currently_playing.add(event.note)
        elif event.type == 'note_off' and event.note in self._currently_playing:
            self._currently_playing.remove(event.note)

    @property
    def current_notes(self):
        return [midi_to_note(n)[:-1] for n in self.current_notes_midi]

    @property
    def current_notes_midi(self):
        return sorted(self._currently_playing)
