from io import BytesIO
from aiofile import AIOFile
from datetime import datetime
import mido

from .base import AppBase
from .features import UseFeature
from .features.buttons import Buttons
from core.events import MidiEvent


@UseFeature(Buttons)
class RecorderApp(AppBase):
    def __init__(self):
        super().__init__()
        self._mid = None
        self._track = None
        self._should_record = False

    def start(self):
        print('Starting')
        self._mid = mido.MidiFile()
        self._add_meta_track()
        self._track = mido.MidiTrack()
        self._track.append(mido.MetaMessage('track_name', name='Piano', time=0))
        self._mid.tracks.append(self._track)
        self.resume()

    def _add_meta_track(self):
        t = mido.MidiTrack()
        t.append(mido.MetaMessage('track_name', name=f'MIDIate Recorder {str(datetime.now())}', time=0))
        t.append(mido.MetaMessage('set_tempo', tempo=500000, time=0))
        t.append(mido.MetaMessage('time_signature', numerator=4, denominator=4, clocks_per_click=24, notated_32nd_notes_per_beat=8, time=0))
        self._mid.tracks.append(t)

    def stop(self):
        self._mid = None
        self._track = None

    def pause(self):
        self._should_record = False

    def resume(self):
        self._should_record = True 

    async def on_event(self, event):
        if not isinstance(event, MidiEvent):
            return

        if self.recording:
            self._track.append(event.value)

    async def save(self):
        f = BytesIO()
        self._mid.save(file=f)
        f.seek(0)
        
        path = self.new_data_file()
        async with AIOFile(path, "wb") as fp:
            await fp.write(f.read())

        print('Saved to', path)
        return path

    @property
    def active(self):
        return self._mid is not None and self._track is not None
    @property
    def recording(self):
        return self.active and self._should_record

    def get_buttons(self):
        buttons = {}

        if self.active:
            if self.recording:
                buttons['Pause'] = self.pause
            else:
                buttons['Resume'] = self.resume
            buttons['Stop'] = self.stop
            buttons['Save'] = self.save
        else:
            buttons['Start'] = self.start

        return buttons

