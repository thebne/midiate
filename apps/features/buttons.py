import cv2 
import asyncio

from ..base import AppFeature
from ..utils import midi_to_note
from core.events import AppEvent, EventType
from core import Manager


class Buttons(AppFeature):
    def __init__(self, instance):
        super().__init__(instance)
        self._button_index = 0

    async def on_event(self, event):
        # ignore if not running
        if not Manager().is_running(self.instance):
            return False

        if not isinstance(event, AppEvent):
            return

        buttons = self.instance.get_buttons()
        print(event)
        if event.value == EventType.LEFT:
            self._button_index = max(0, self._button_index - 1)
        elif event.value == EventType.RIGHT:
            self._button_index = min(len(buttons) - 1, self._button_index + 1)
        elif event.value == EventType.ENTER:
            # assume dict is ordered (pyver >= 3.7)
            fn = list(buttons.values())[self._button_index]
            if asyncio.iscoroutinefunction(fn):
                await fn()
            else:
                fn()

    async def on_update(self):
        # draw buttons from get_buttons()
        if not hasattr(self.instance, 'get_buttons'):
            raise NotImplementedError('get_buttons() must be implemented on instance')

        buttons = self.instance.get_buttons()
        frame = self.instance._ui.get_default_frame()

        for i, name in enumerate(buttons):
            font                   = cv2.FONT_HERSHEY_SIMPLEX
            fontScale              = 1
            thickness              = 2
            x, y = 100, 100 + i * 45

            color = (255, 0, 0) if  i == self._button_index else (127, 127, 127)

            cv2.putText(frame, name, 
                            (x, y), 
                            font, 
                            fontScale,
                            color,
                            thickness,
                            cv2.LINE_AA)

            cv2.rectangle(frame, (x - 10, y + 10), (x + 250, y - 30), color, thickness)

        self.instance._ui.set_frame(frame)
