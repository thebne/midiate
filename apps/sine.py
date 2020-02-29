import time
import numpy as np
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure

from .base import AppBase
from .features import UseFeature, CurrentNotes

@UseFeature(CurrentNotes)
class SineWaveApp(AppBase):
    async def on_update(self):
        frame = self._ui.get_default_frame()

        fig = Figure()
        canvas = FigureCanvas(fig)
        ax = fig.gca()

        # add waves
        t = np.linspace(0, 1/6, 300)
        amp = np.zeros(t.shape)
        for midi_note in self.current_notes_midi:
            amp += np.sin(t * self.note_to_freq(midi_note))

        ax.plot(t, amp)
        #ax.set_ylim(-1.1, 1.1)
        #ax.axis('off')

        canvas.draw()
        width, height = fig.get_size_inches() * fig.get_dpi()
        image = np.fromstring(canvas.tostring_rgb(), dtype='uint8').reshape(int(height), int(width), 3)

        y, x, c = image.shape
        frame[:y, :x] = image

        self._ui.set_frame(frame)

    @staticmethod
    def note_to_freq(note):
        a = 440 #frequency of A (coomon value is 440Hz)
        return (a / 32) * (2 ** ((note - 9) / 12))
