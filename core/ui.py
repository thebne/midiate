from dataclasses import dataclass, field
from typing import List
import numpy as np
import cv2


@dataclass
class FrameContext:
    text: str = field(default="")
    image: np.array = field(default_factory=lambda: np.ones((600, 800, 3), dtype=np.uint8) * 255)


class UI:
    def __init__(self):
        self.clean()

        self._prev_text = None

    def get_frame(self):
        # TODO write logic to blend drawn frames / text together
        frame = self._frame_ctx.image
        text = self.get_text()
        if self._prev_text != text:
            self.clean()
        if text and len(text):
            font                   = cv2.FONT_HERSHEY_SIMPLEX
            fontScale              = 3
            fontColor              = (0,0,0)
            thickness              = 2

            cv2.putText(frame, text, 
                            (120, 300), 
                            font, 
                            fontScale,
                            fontColor,
                            thickness,
                            cv2.LINE_AA)

        return frame

    def get_text(self):
        return self._frame_ctx.text

    def clean(self):
        # mark current frame as done
        self._frame_ctx = FrameContext()
        self._dirty = False

    @property
    def is_dirty(self):
        return self._dirty

    def get_default_frame(self):
        return FrameContext().image

    def set_text(self, text):
        self._frame_ctx.text = text
        self._dirty = True

    def set_frame(self, image):
        # clean before
        self.clean()

        self._frame_ctx.image = image
        self._dirty = True


    def __get__(self, instance, owner):
        # TODO check if app is running on background, if so, dont allow to call set() functions
        print(self, instance, owner)
        return self
