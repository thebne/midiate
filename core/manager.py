import asyncio 

from .ui import UI
from .utils import Singleton
from .events import AppEvent, EventType

class Manager(metaclass=Singleton):
    def __init__(self):
        self._input = None
        self._output = None

        self._apps = {} 
        self._foreground_app = None
        self._default_app = None
        self._event_queue = None

    def set_input(self, input):
        self._input = input
    def set_output(self, output):
        self._output = output

    def register_app(self, app, default=False):
        print('registering', app)
        app.set_ui(self._output.get_ui())
        self._apps[type(app)] = app

        if default:
            self._default_app = app 

    async def open_app(self, app_class):
        if app_class not in map(type, self._apps):
            self.register_app(app_class())

        await self.set_foreground_app(self._apps[app_class])

    def is_running(self, app):
        return self._foreground_app is app

    async def run(self):
        self._event_queue = asyncio.Queue()

        await asyncio.gather(self._input.prepare(), self._output.prepare(),
                *[app.prepare() for app in self._apps.values()])

        input_event_task = asyncio.create_task(self._handle_input_events())
        event_task = asyncio.create_task(self._propagate_events())

        while True:
            if self._foreground_app is None:
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
            if event_task.done():
                raise RuntimeError('Event task is inactive')

    async def _wait_for_next_frame(self):
        # TODO use time passed to determine
        return await asyncio.sleep(1 / 60)

    async def _handle_input_events(self):
        while True:
            event = await self._input.event_queue.get()
            await self._event_queue.put(event)
            self._input.event_queue.task_done()

    async def _propagate_events(self):
        while True:
            event = await self._event_queue.get()
            # try to handle event youtself first
            if not await self._handle_event(event):
                # relook at self._apps each iteration, in case of new apps
                await asyncio.gather(*[self._propagate_event_to_app(app, event) for app in self._apps.values()]) 
            self._event_queue.task_done()

    async def _handle_event(self, event):
        if not isinstance(event, AppEvent):
            return False

        if event.value == EventType.SWITCH_TO_DEFAULT_APP:
            await self.set_foreground_app(self._default_app)
            return True

        return False

    async def fire_event(self, event):
        await self._event_queue.put(event)

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

