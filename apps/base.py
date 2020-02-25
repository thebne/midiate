import tempfile


class AppBase:
    output_type = None

    def __init__(self):
        if self.output_type is None:
            raise ValueError("App must declare an output type")

        self._data_path = None

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

    async def prepare(self):
        pass

    @property
    def data_path(self):
        if self._data_path is None:
            # create data path
            import tempfile
            self._data_path = tempfile.mkdtemp(prefix=f'app_{self.__class__.__name__}.')

        return self._data_path

    def new_data_file(self):
        h, path = tempfile.mkstemp(dir=self.data_path)
        return path


class AppFeature(AppBase):
    def __init__(self, instance):
        super().__init__()
        self.instance = instance
