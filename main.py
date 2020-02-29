import asyncio 

from core import Manager
from core.input import MidiLiveInput, MidiFileInput
from core.output.simple import SimpleVisualOutput
from apps import DefaultApp
from apps.recorder import RecorderApp

def main():
    mgr = Manager()
    #mgr.set_input(MidiFileInput('samples/MIDI_sample.mid'))
    mgr.set_input(MidiLiveInput("Roland Digital Piano"))
    mgr.set_output(SimpleVisualOutput())

    mgr.register_app(DefaultApp(), default=True)

    asyncio.run(mgr.run())

if __name__ == '__main__':
    main()
