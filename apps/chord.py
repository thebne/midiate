from .base import AppBase
from .features import UseFeature, CurrentNotes
from core.output.types import OutputType

import mido
import pychord 
import cv2

@UseFeature(CurrentNotes)
class ChordApp(AppBase):
    def __init__(self, output_type=OutputType.Visual):
        self.output_type = output_type
        super().__init__()

    @staticmethod
    def _find_chord(notes):
        guesses = [x.chord for x in pychord.note_to_chord(notes)]
        if len(guesses):
            return " OR ".join(guesses)

        return None

    async def on_update(self):
        if self.output_type == OutputType.Visual:
            return await self.update_visual()
        elif self.output_type == OutputType.Textual:
            return await self.update_textual()

    async def update_visual(self):
        frame = self._ui.get_default_frame()
        current = self.current_notes

        if len(current):
            text = self._find_chord(current)
            if text and len(text):
                font                   = cv2.FONT_HERSHEY_SIMPLEX
                fontScale              = 3
                fontColor              = (255,0,0)
                thickness              = 2

                cv2.putText(frame, text, 
                                (120, 300), 
                                font, 
                                fontScale,
                                fontColor,
                                thickness,
                                cv2.LINE_AA)

        if len(current):
            font                   = cv2.FONT_HERSHEY_SIMPLEX
            fontScale              = 1
            fontColor              = (0,0,255)
            thickness              = 2

            cv2.putText(frame, ",".join(current), 
                            (220, 400), 
                            font, 
                            fontScale,
                            fontColor,
                            thickness,
                            cv2.LINE_AA)

        self._ui.set_frame(frame)

    async def update_textual(self):
        current = self.current_notes
        if len(current):
            text = self._find_chord(current)
        else:
            text = None
        self._ui.set_text(text)

if __name__ == '__main__':
    main()
