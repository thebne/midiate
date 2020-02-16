import asyncio 

from .ui import UI

class Manager:
    def __init__(self, input, output):
        self._input = input
        self._output = output

        self._apps = set()
        self._foreground_app = None

    def register_app(self, app):
        app.set_ui(self._output.get_ui())
        self._apps.add(app)

    async def run(self):
        event_task = asyncio.create_task(self._propagate_events())
        while True:
            if self._foreground_app is None:
                # FIXME currently randomly select the first app
                await self.set_foreground_app(list(self._apps)[0])

            await self._foreground_app.on_update()

            await asyncio.gather(self._output.render(), self._wait_for_next_frame())
            if event_task.done():
                raise RuntimeError('Event task is inactive')

    async def _wait_for_next_frame(self):
        # TODO use time passed to determine
        return await asyncio.sleep(.01)

    async def _propagate_events(self):
        async for event in self._input.get_next_event():
            # relook at self._apps each iteration, in case of new apps
            await asyncio.gather(*[self._propagate_event_to_app(app, event) for app in self._apps]) 

    async def set_foreground_app(self, app):
        if self._foreground_app: 
            await self._foreground_app.on_move_to_background()

        self._foreground_app = app

        if self._foreground_app: 
            await self._foreground_app.on_move_to_foreground()

    async def _propagate_event_to_app(self, app, event):
        try:
            await app.on_event(event)
        except:
            # TODO gracefully shut down app
            print("app error!")
            raise

