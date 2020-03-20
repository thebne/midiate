import zmq
import sys
import struct
from datetime import datetime 
from time import perf_counter
from mido import Message, MidiFile, MidiTrack, MetaMessage, second2tick

HOST = "127.0.0.1"
INPUT_ZMQ_URL = f"tcp://{HOST}:20300"
NANOSECONDS_IN_SECONDS = 10**9

mid = MidiFile()

def main():
    ctx = zmq.Context()
    sock = ctx.socket(zmq.SUB)
    sock.connect(INPUT_ZMQ_URL)
    sock.subscribe(b'')

    track = MidiTrack()
    track.append(MetaMessage('track_name', name=f'MIDIate Recorder {str(datetime.now())}', time=0))
    track.append(MetaMessage('set_tempo', tempo=500000, time=0))
    track.append(MetaMessage('time_signature', numerator=4, denominator=4, clocks_per_click=24, notated_32nd_notes_per_beat=8, time=0))
    mid.tracks.append(track)

    while True:
        print('Recording...')
        data = sock.recv()
        msg, current_ts = data[0:3], data[3:]
        current_ts, = struct.unpack("<Q", current_ts)
        print(f'current_ts is {current_ts}')
        msg = Message.from_bytes(msg) 
        msg.time = int(second2tick(current_ts / NANOSECONDS_IN_SECONDS, 480, 500000))
        track.append(msg)
        print('Msg: ' ,msg)
        # import pdb; pdb.set_trace()

try:
    main()
except KeyboardInterrupt:
    print('Recorder stopped')
    for msg in mid: print (msg)
    mid.save('samples/special_song2.mid')
    sys.exit()    

