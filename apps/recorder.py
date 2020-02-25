from io import BytesIO
from aiofile import AIOFile
from datetime import datetime
import mido

from .base import AppBase
from core.output.types import OutputType

class RecorderApp(AppBase):
    output_type = OutputType.Background

    def __init__(self):
        super().__init__()
        self.start()

    def start(self):
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
        if self._track is not None:
            self._track.append(event)

    async def save(self):
        f = BytesIO()
        self._mid.save(file=f)
        f.seek(0)
        async with AIOFile("/tmp/recording.mid", "wb") as fp:
            await fp.write(f.read())

    async def prepare(self):
        import asyncio
        async def save_future():
            await asyncio.sleep(10)
            print('saving!')
            await self.save()
        asyncio.create_task(save_future())
