from .base import AppBase
from core.output.types import OutputType

import mido
import pychord 
from pygame.midi import midi_to_ansi_note

class ChordApp(AppBase):
    output_type = OutputType.Textual

    def __init__(self):
        super().__init__()
        self._currently_playing = set()

    @staticmethod
    def _find_chord(midi_notes):
        # arrange by octave and remove
        notes = [midi_to_ansi_note(n)[:-1] for n in sorted(midi_notes)]

        guesses = [x.chord for x in pychord.note_to_chord(notes)]
        if len(guesses):
            return " OR ".join(guesses)

        return f"<Notes {','.join(notes)}>"

    async def on_event(self, event):
        if event.type == 'note_on':
            self._currently_playing.add(event.note)
        elif event.type == 'note_off' and event.note in self._currently_playing:
            self._currently_playing.remove(event.note)

    async def on_update(self):
        if len(self._currently_playing):
            text = self._find_chord(self._currently_playing)
        else:
            text = ""

        self._ui.set_text(text)


if __name__ == '__main__':
    main()
