from .base import OutputBase


class TextualOutput(OutputBase):
    def __init__(self):
        super().__init__()

        self._last_text = None

    async def _render(self):
        text = self._ui.get_text()
        if len(text) and text != self._last_text:
            print(text)
            self._last_text = text

