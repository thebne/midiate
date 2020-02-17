from .types import OutputType


class OutputBase:
    output_type = None

    def __init__(self):
        if self.output_type is None:
            raise ValueError("Output must declare an output type")

        from ..ui import UI
        self._ui = UI(self.output_type)

    async def prepare(self, event_callbacks=None):
        pass

    def get_ui(self):
        return self._ui

    async def render(self):
        if self._ui.is_dirty:
            await self._render()
            # TODO ???
            #self._ui.clean()

    async def _render(self):
        raise NotImplementedError()
