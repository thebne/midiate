import zmq
import struct
from time import perf_counter
from mido import Message, MidiFile, MidiTrack

HOST = "127.0.0.1"
INPUT_ZMQ_URL = f"tcp://{HOST}:20300"

ctx = zmq.Context()
sock = ctx.socket(zmq.SUB)
sock.connect(INPUT_ZMQ_URL)
sock.subscribe(b'')

mid = MidiFile()
track = MidiTrack()
mid.tracks.append(track)

prev_ts = 0

while True:
    data = sock.recv()
    msg, current_ts = data[0:3], data[3:]
    import pdb; pdb.set_trace()
    current_ts, = struct.unpack("<Q", current_ts)
    import pbd; pbd.set_trace()
    msg.time = mido.second2tick(current_ts - prev_ts, 480, 500000) 
    track.append(msg)
