#!/usr/bin/env python
from async_timeout import timeout
import json
import os
from quart import Quart, websocket, request
from quart_cors import cors
import zmq
import zmq.asyncio
import sqlite3
import re

# TODO use env vars
HOST = "127.0.0.1"
INPUT_ZMQ_URL           = f"tcp://{HOST}:20300"
EVENT_OUTPUT_ZMQ_URL    = f"tcp://{HOST}:20301"
SETTINGS_ZMQ_URL        = f"tcp://{HOST}:20302"


ROOT_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
app = Quart(__name__, static_url_path='', static_folder=os.path.join(ROOT_FOLDER, 'client/build'))
app = cors(app, allow_origin="*")
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
        await websocket.send(data)


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

############## Search logic - TODO: move outside and switch to FTS db ##############
chordmap = {
    'C': 0,
    'C#': 1,
    'D': 2,
    'Eb': 3,
    'E': 4,
    'F': 5,
    'F#': 6,
    'G': 7,
    'Ab': 8,
    'A': 9,
    'Bb': 10,
    'B': 11
}

replacors = {
    '\'': '',
    'Db': 'C#',
    'D#': 'Eb',
    'Bb': 'F#',
    'G#': 'Ab',
    'A#': 'Bb',
    ',': ' '}
    
rep = dict((re.escape(k), v) for k, v in replacors.items()) 
pattern = re.compile("|".join(replacors.keys()))
normalize = lambda text: pattern.sub(lambda m: rep[re.escape(m.group(0))], text)

def transpose_chord(chord, offset):   
    twochar = chord[:2]
    if twochar in chordmap:
        return list(chordmap.keys())[(chordmap[twochar] + offset) % 12] + chord[2:]
    else:
        return list(chordmap.keys())[(chordmap[chord[0]] + offset) % 12] + chord[1:]

def create_transposed_string(sequence, offset):
    lst = []
    for chord in sequence.split(' '):
        lst.append(transpose_chord(chord, offset))
    
    # TODO: wrap chord as tokens to avoid C,D == C,Dm
    return ",".join(lst)

@app.route('/api')
def data():
	# get chords, e.g http://127.0.0.1:5000/api?chords=C,G
	chords = request.args.get('chords')

	# normalize & transpose to all 12 scales
	sequence = normalize(chords)           
	strings_to_search = [create_transposed_string(sequence, i) for i in range(12)]	   

	# connect to DB
	conn = sqlite3.connect('./ChorDB.db')
	
	# execute query
	c = conn.cursor()
	result = c.execute('''
        SELECT artist, song, chords, link
        FROM MyTable
        WHERE chords LIKE '%{strings_to_search[0]}%'    
        OR chords LIKE '%{strings_to_search[1]}%'
        OR chords LIKE '%{strings_to_search[2]}%'
        OR chords LIKE '%{strings_to_search[3]}%'
        OR chords LIKE '%{strings_to_search[4]}%'
        OR chords LIKE '%{strings_to_search[5]}%'
        OR chords LIKE '%{strings_to_search[6]}%'
        OR chords LIKE '%{strings_to_search[7]}%'
        OR chords LIKE '%{strings_to_search[8]}%'
        OR chords LIKE '%{strings_to_search[9]}%'
        OR chords LIKE '%{strings_to_search[10]}%'
        OR chords LIKE '%{strings_to_search[11]}%'
        '''.format(strings_to_search=strings_to_search))
	conn.commit()
	
	# serialize
	items = [dict(zip([key[0] for key in c.description], row)) for row in result]
	return json.dumps(items), 200, {'Content-Type': 'application/json; charset=utf-8'}

def main():
    app.run(host="0.0.0.0")


if __name__ == '__main__':
    main()

