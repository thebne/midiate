from .base import OutputBase
from .types import OutputType


class TextualOutput(OutputBase):
    output_type = OutputType.Textual

    def __init__(self):
        super().__init__()

        self._last_text = None

    async def _render(self):
        text = self._ui.get_text()
        if len(text) and text != self._last_text:
            print(text)
            self._last_text = text

