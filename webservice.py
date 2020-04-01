import json
from quart import Quart, websocket
import zmq
import zmq.asyncio


# TODO use env vars
HOST = "127.0.0.1"
INPUT_ZMQ_URL = f"tcp://{HOST}:20300"
OUTPUT_ZMQ_URL = f"tcp://{HOST}:20301"


app = Quart(__name__, static_url_path='', static_folder='client/build')
ctx = zmq.asyncio.Context()

out_sock = ctx.socket(zmq.ROUTER)
out_sock.bind(OUTPUT_ZMQ_URL)

@app.route('/')
async def index():
    return await app.send_static_file('index.html')


@app.websocket('/ws/input')
async def broadcast_input_events():
    sock = ctx.socket(zmq.SUB)
    sock.connect(INPUT_ZMQ_URL)
    sock.subscribe(b'')

    while True:
        data = await sock.recv()
        current_ts, msg = data[:8], data[8:]
        # TODO send current_ts to client
        await websocket.send(msg)


@app.route('/output', methods=['POST'])
async def route_output_event():

    while True:
        event = await out_sock.recv_multipart()
        await websocket.send(event)


app.run(host="0.0.0.0")
