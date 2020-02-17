import asyncio 

from core import Manager
from core.input import MidiInput
from core.output.simple import SimpleVisualOutput, SimpleTextualOutput
from apps import DefaultApp

def main():
    mgr = Manager(MidiInput("Roland Digital Piano"), SimpleVisualOutput())
    mgr.register_app(DefaultApp(mgr), default=True)

    asyncio.run(mgr.run())

if __name__ == '__main__':
    main()
