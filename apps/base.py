class AppBase:
    output_type = None

    def __init__(self):
        if self.output_type is None:
            raise ValueError("App must declare an output type")

    def set_ui(self, ui):
        ui.assert_compatible(self.output_type)
        self._ui = ui

    async def on_event(self, event):
        pass

    async def on_update(self):
        pass

    async def on_move_to_background(self):
        pass

    async def on_move_to_foreground(self):
        pass
