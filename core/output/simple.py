from tkinter import *
import asyncio
import numpy as np
from PIL import Image, ImageTk

from .base import OutputBase
from ..events import AppEvent, EventType

class SimpleVisualOutput(OutputBase):
    async def prepare(self):
        await super().prepare()
        app = Tk()
        app.geometry('800x600')

        canvas = Canvas(app, height=600, width=800)
        canvas.pack()
        # TODO remove coupling between sizes (maybe just output decides and tells UI, or UI decides and output resizes
        img = canvas.create_image(800 /2, 600 /2, image=self._np_to_tk(self._ui.get_default_frame()))

        self._app = app
        self._canvas = canvas
        self._image = img

        # activate firing events to support keyboard
        self._activate_events()

    async def _render(self):
        frame = self._np_to_tk(self._ui.get_frame())
        self._canvas.itemconfig(self._image, image=frame)
        self._canvas.image = frame
        self._app.update()

    @staticmethod
    def _np_to_tk(np_img):
        return ImageTk.PhotoImage(image=Image.fromarray(np_img, mode='RGB'))


    def _activate_events(self):
        self._app.bind("<Key>", self._key_event_callback)

    def _key_event_callback(self, event):
        e = None
        if event.keysym == "Left" or event.keysym == "Up":
            e = EventType.LEFT
        elif event.keysym == "Right" or event.keysym == "Down":
            e = EventType.RIGHT
        elif event.keysym == "Return":
            e = EventType.ENTER
        elif event.keysym == "Escape":
            e = EventType.SWITCH_TO_DEFAULT_APP

        if e is not None:
            self._queue.put_nowait(AppEvent(e))

