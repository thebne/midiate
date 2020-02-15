import mido
import pychord 
from music21.chord import Chord
from pygame.midi import midi_to_ansi_note


def init_midi(name):
    dev_name = [n for n in mido.get_input_names() if name in n][0]
    return mido.open_input(dev_name)


def find_chord(midi_notes):
    # arrange by octave and remove
    notes = [midi_to_ansi_note(n)[:-1] for n in sorted(midi_notes)]

    guesses = [x.chord for x in pychord.note_to_chord(notes)]
    if len(guesses):
        return " // ".join(guesses)

    return Chord(notes).pitchedCommonName
    

def main():
    # nasty and hacky, but works for now
    #simplify_chord_names()

    dev = init_midi("Roland Digital Piano")

    currently_playing = set()
    reading = True
    while reading:
        msg = dev.receive()
        if msg.type == 'note_on':
            currently_playing.add(msg.note)
        elif msg.type == 'note_off' and msg.note in currently_playing:
            currently_playing.remove(msg.note)

        if len(currently_playing) >= 2:
            c = find_chord([x for x in currently_playing])
            if len(c):
                print(c)


if __name__ == '__main__':
    main()
