class InputBase:
    async def get_next_event(self):
        raise NotImplementedError()
