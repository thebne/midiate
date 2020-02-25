import asyncio 

from core import Manager
from core.input import MidiInput
from core.output.simple import SimpleVisualOutput, SimpleTextualOutput
from apps import DefaultApp
from apps.recorder import RecorderApp

def main():
    mgr = Manager()
    mgr.set_input(MidiInput("Roland Digital Piano"))
    mgr.set_output(SimpleVisualOutput())

    mgr.register_app(DefaultApp(), default=True)

    asyncio.run(mgr.run())

if __name__ == '__main__':
    main()
