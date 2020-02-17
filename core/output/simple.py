import tkinter as tk
import asyncio
import numpy as np
from PIL import Image, ImageTk

from .base import OutputBase
from .types import OutputType


class SimpleVisualOutput(OutputBase):
    output_type = OutputType.Visual

    async def prepare(self):
        app = tk.Tk()
        app.geometry('800x600')

        canvas = tk.Canvas(app, height=600, width=800)
        canvas.pack()
        # TODO remove coupling between sizes (maybe just output decides and tells UI, or UI decides and output resizes
        img = canvas.create_image(800 /2, 600 /2, image=self._np_to_tk(self._ui.get_default_frame()))

        self._app = app
        self._canvas = canvas
        self._image = img

    async def _render(self):
        frame = self._np_to_tk(self._ui.get_frame())
        self._canvas.itemconfig(self._image, image=frame)
        self._canvas.image = frame
        self._app.update()

    @staticmethod
    def _np_to_tk(np_img):
        return ImageTk.PhotoImage(image=Image.fromarray(np_img, mode='RGB'))



class SimpleTextualOutput(OutputBase):
    output_type = OutputType.Textual

    def __init__(self):
        super().__init__()

        self._last_text = None

    async def _render(self):
        text = self._ui.get_text()
        if len(text) and text != self._last_text:
            print(text)
            self._last_text = text

