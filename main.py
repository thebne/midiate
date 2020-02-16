import asyncio 

from core import Manager
from core.input import MidiInput
from core.output.simple import SimpleVisualOutput
from apps import ChordApp

def main():
    mgr = Manager(MidiInput("Roland Digital Piano"), SimpleVisualOutput())
    mgr.register_app(ChordApp())

    asyncio.get_event_loop().run_until_complete(mgr.run())

if __name__ == '__main__':
    main()
