import zmq
import sys
import struct
import argparse
from datetime import datetime 
from time import perf_counter
from mido import Message, MidiFile, MidiTrack, MetaMessage, second2tick

HOST = "127.0.0.1"
INPUT_ZMQ_URL = f"tcp://{HOST}:20300"
NANOSECONDS_IN_SECONDS = 10**9
TICKS_PER_BEAT = 480  # standard in most midi software
TEMPO = 500000  # microseconds per beat; standard is 120bpm

mid = MidiFile()

def recorder():
    ctx = zmq.Context()
    sock = ctx.socket(zmq.SUB)
    sock.connect(INPUT_ZMQ_URL)
    sock.subscribe(b'')

    track = MidiTrack()
    track.append(MetaMessage('track_name', name=f'MIDIate Recorder {str(datetime.now())}', time=0))
    mid.tracks.append(track)
            
    print('Recording...')
    while True:
        data = sock.recv()
        msg, current_ts = data[0:3], data[3:]
        current_ts, = struct.unpack("<Q", current_ts)
        msg = Message.from_bytes(msg) 
        msg.time = int(second2tick(current_ts / NANOSECONDS_IN_SECONDS, TICKS_PER_BEAT, TEMPO))
        track.append(msg)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('output_path', help='path of output file')
    
    args = parser.parse_args()

    try:
        recorder()
    except KeyboardInterrupt:
        print('Recorder stopped.')
        mid.save(args.output_path)
        sys.exit()    

if __name__ == '__main__':
    main()
