from dataclasses import dataclass, field
from typing import List
import numpy as np

from .output.types import OutputType


@dataclass
class FrameContext:
    text: str = field(default="")
    image: np.array = field(default=None)


class UI:
    def __init__(self, output_type):
        self._output_type = output_type
        self.clean()

    def assert_compatible(self, output_type):
       if self._output_type == OutputType.Textual and output_type == OutputType.Visual:
            raise RuntimeError(f"output type {output_type} is not compatible with UI")

    def get_frame(self):
        # TODO write logic to blend drawn frames / text together
        return self._frame_ctx.image

    def get_text(self):
        return self._frame_ctx.text

    def clean(self):
        # mark current frame as done
        self._frame_ctx = FrameContext()
        self._dirty = False

    @property
    def is_dirty(self):
        return self._dirty

    def set_text(self, text):
        self._frame_ctx.text = text
        self._dirty = True

    def set_frame(self, image):
        self._frame_ctx.image = image
        self._dirty = True


    def __get__(args):
        # TODO check if app is running on background, if so, dont allow to call set() functions
        pass
