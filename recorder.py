import os
import zmq
import sys
import struct
import argparse
from datetime import datetime 
from time import perf_counter
from mido import Message, MidiFile, MidiTrack, MetaMessage, second2tick, bpm2tempo

HOST = "127.0.0.1"
INPUT_ZMQ_URL = f"tcp://{HOST}:20300"
NANOSECONDS_IN_SECONDS = 10**9
TICKS_PER_BEAT = 480  # standard in most midi software


def record(midi_file, bpm):
    ctx = zmq.Context()
    sock = ctx.socket(zmq.SUB)
    sock.connect(INPUT_ZMQ_URL)
    sock.subscribe(b'')

    track = MidiTrack()
    track.append(MetaMessage('track_name', name=f'MIDIate Recorder {str(datetime.now())}', time=0))
    midi_file.tracks.append(track)
            
    print('Recording...')
    try:
        while True:
            data = sock.recv()
            current_ts, msg = data[:8], data[8:]
            current_ts, = struct.unpack("<Q", current_ts)
            msg = Message.from_bytes(msg) 
            msg.time = int(second2tick(current_ts / NANOSECONDS_IN_SECONDS,
                TICKS_PER_BEAT, bpm2tempo(bpm)))
            track.append(msg)
    except KeyboardInterrupt:
        print('Recorder stopped.')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('output_path', help='path of output file')
    parser.add_argument('--bpm', type=int, default=120, help='Beats-per-minute for           recorded track (default %(default)s)')
    
    args = parser.parse_args()

    if not os.path.exists(os.path.dirname(os.path.abspath(args.output_path))):
        raise RuntimeError("Couldn't find parent directory for output_path")

    mid = MidiFile()
    record(mid, args.bpm)
    mid.save(args.output_path)
    print('saved to', args.output_path)

if __name__ == '__main__':
    main()
