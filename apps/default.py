from .base import AppBase
from .chord import ChordApp

from core.output.types import OutputType

class DefaultApp(AppBase):
    output_type = OutputType.Textual

    def __init__(self, manager):
        # Default app has to control apps
        super().__init__()
        self._manager = manager

    async def on_event(self, event):
        if event.note == 99:
            await self._manager.open_app(ChordApp)

        print(event)
    async def on_update(self):
        self._ui.set_text("Default")


if __name__ == '__main__':
    main()
