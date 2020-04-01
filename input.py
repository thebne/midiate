import argparse
import mido
import zmq
import struct
import time


# TODO use env vars
HOST = "127.0.0.1"
INPUT_ZMQ_URL = f"tcp://{HOST}:20300"


context = zmq.Context()
socket = context.socket(zmq.PUB)
socket.bind(INPUT_ZMQ_URL)


def timed_sender():
    yield
    t1 = time.perf_counter_ns()
    t2 = t1
    while True:
        msg = yield t2 - t1

        arr = bytearray()
        arr += struct.pack("<Q", t2 - t1)
        arr += msg.bin()
        socket.send(arr)

        t1 = t2
        t2 = time.perf_counter_ns()


def stream_live(device_name):
    print("Streaming from", device_name, "(live)")
    with mido.open_input(device_name) as port:
        sender = timed_sender()
        next(sender)
        for msg in port:
            sender.send(msg)


def stream_file(file_path, loop):
    print("Streaming from", file_path, "(file)")
    while True:
        mid = mido.MidiFile(file_path)
        sender = timed_sender()
        next(sender)
        for msg in mid.play():
            sender.send(msg)

        if not loop:
            return


def list_inputs():
    inputs = mido.get_input_names()
    if not inputs:
        print("<empty>")
    for in_ in inputs:
        print("-", in_)


def main():
    parser = argparse.ArgumentParser()
    grp = parser.add_mutually_exclusive_group(required=True)
    grp.add_argument('--device', metavar='<device name>', help="MIDI input device")
    grp.add_argument('--file', metavar='<file path>', help="MIDI file")
    grp.add_argument('--list', action="store_true", help="List all MIDI input devices")
    parser.add_argument('--loop', action="store_true", default=False, help="Loop the file every time it ends (relevant to files only)")

    args = parser.parse_args()

    if args.file is not None:
        return stream_file(args.file, args.loop)

    if args.device is not None:
        return stream_live(args.device)

    if args.list:
        return list_inputs()

if __name__ == '__main__':
    main()
