import asyncio 

from .ui import UI

class Manager:
    def __init__(self, input, output):
        self._input = input
        self._output = output

        self._apps = {} 
        self._foreground_app = None
        self._default_app = None

    def register_app(self, app, default=False):
        app.set_ui(self._output.get_ui())
        self._apps[type(app)] = app

        if default:
            self._default_app = app 

    async def open_app(self, app_class):
        if app_class not in map(type, self._apps):
            self.register_app(app_class())

        await self.set_foreground_app(self._apps[app_class])
            

    async def run(self):
        await asyncio.gather(self._input.prepare(), self._output.prepare())
        event_task = asyncio.create_task(self._propagate_events())

        while True:
            if self._foreground_app is None or self._input.signal_set():
                if self._default_app is None:
                    raise RuntimeError('no default app set')
                print('Giving control to default app')
                await self.set_foreground_app(self._default_app)

            # make input process events explicitly to avoid gui locks
            await self._input.process_events()

            # only onUpdate foreground app
            # TODO support running more than one? limit time?
            await self._foreground_app.on_update()

            await asyncio.gather(self._output.render(), self._wait_for_next_frame())
            #if event_task.done():
            #    raise RuntimeError('Event task is inactive')

    async def _wait_for_next_frame(self):
        # TODO use time passed to determine
        return await asyncio.sleep(1 / 60)

    async def _propagate_events(self):
        while True:
            event = await self._input.event_queue.get()
            # relook at self._apps each iteration, in case of new apps
            await asyncio.gather(*[self._propagate_event_to_app(app, event) for app in self._apps.values()]) 
            self._input.event_queue.task_done()

    async def set_foreground_app(self, app):
        if self._foreground_app == app:
            return

        print(f'sending {self._foreground_app} to background')
        if self._foreground_app: 
            await self._foreground_app.on_move_to_background()

        self._foreground_app = app

        print(f'bringing {self._foreground_app} to foreground')
        if self._foreground_app: 
            await self._foreground_app.on_move_to_foreground()

    async def _propagate_event_to_app(self, app, event):
        try:
            await app.on_event(event)
        except:
            # TODO gracefully shut down app
            print(f"app error! {app}")
            import traceback
            traceback.print_exc()

