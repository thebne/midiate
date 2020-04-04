#!/usr/bin/env python
from async_timeout import timeout
import json
import os
from quart import Quart, websocket, request
import uvloop
import zmq
import zmq.asyncio


# TODO use env vars
HOST = "127.0.0.1"
INPUT_ZMQ_URL           = f"tcp://{HOST}:20300"
EVENT_OUTPUT_ZMQ_URL    = f"tcp://{HOST}:20301"
SETTINGS_ZMQ_URL        = f"tcp://{HOST}:20302"


ROOT_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
app = Quart(__name__, static_url_path='', static_folder=os.path.join(ROOT_FOLDER, 'client/build'))
ctx = zmq.asyncio.Context()

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


@app.route('/event', methods=['POST'])
async def route_output_event():
    sock = ctx.socket(zmq.REQ)
    sock.connect(EVENT_OUTPUT_ZMQ_URL)
    async with timeout(app.config['BODY_TIMEOUT']):
        return await sock.send_json(await request.get_data())


@app.route('/settings/<app_name>', methods=['POST'])
async def route_modify_settings(app_name):
    sock = ctx.socket(zmq.REQ)
    sock.connect(SETTINGS_ZMQ_URL)
    async with timeout(app.config['BODY_TIMEOUT']):
        await out_sock.send_json({
            'app': app_name,
            'action': 'modify', 
            'validity': request.args['validity'],
            'body': await request.get_data()
        })

@app.route('/settings/<app_name>')
async def route_get_settings(app_name):
    sock = ctx.socket(zmq.REQ)
    sock.connect(SETTINGS_ZMQ_URL)
    async with timeout(app.config['BODY_TIMEOUT']):
        await out_sock.send_json({
            'app': app_name,
            'action': 'get',
        })


def main():
    uvloop.install()
    app.run(host="0.0.0.0")


if __name__ == '__main__':
    main()

