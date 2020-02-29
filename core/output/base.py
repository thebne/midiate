import asyncio

class OutputBase:
    def __init__(self, ui_class=None):
        self._queue = None

        if ui_class is None:
            from ..ui import UI
            ui_class = UI
        self._ui = ui_class()

    async def prepare(self, event_callbacks=None):
        self._queue = asyncio.Queue()

    def get_ui(self):
        return self._ui

    async def render(self):
        if self._ui.is_dirty:
            await self._render()
            # TODO ???
            #self._ui.clean()

    async def _render(self):
        raise NotImplementedError()

    @property
    def event_queue(self):
        return self._queue
