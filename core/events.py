from enum import Enum

class Event:
    def __init__(self, value):
        self._value = value

    def __getattr__(self, key):
        return getattr(self.value, key)

    @property
    def value(self):
        return self._value

class MidiEvent(Event):
    pass

class AppEvent(Event):
    pass


class EventType(Enum):
    SWITCH_TO_DEFAULT_APP = 0
    LOCK = 1
    LEFT = 2
    RIGHT = 3
    ENTER = 4
