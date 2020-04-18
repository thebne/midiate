const http = require('http')
const WebSocket = require('ws')
const url = require('url')
const midi = require('midi')

const INSTRUMENT_NAME = "Roland Digital Piano:Roland Digital Piano MIDI 1 24:0"

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let input 
async function open(name) {
  if (input)
    return input

  let names = []
  let prevCount = null
  input = new midi.Input()
  while (!names.includes(name)) { 
    while (prevCount === input.getPortCount()) {
      await sleep(500)
    }
    prevCount = input.getPortCount()
    names = ([...Array(prevCount).keys()]
      .map(p => input.getPortName(p)))
  }
  input.openPort(names.indexOf(name))
  return input
}

function close() {
  input.closePort()
  input = null
}


const server = http.createServer()
const wss = new WebSocket.Server({ noServer: true })

wss.on('connection', async (ws) => {
  (await open(INSTRUMENT_NAME)).on('message', (deltaTime, message) => {
    const buffer = new ArrayBuffer(11)
    const view = new DataView(buffer)
    view.setFloat64(0, deltaTime)
    for (let i = 0; i < message.length; ++i) {
      view.setUint8(8 + i, message[i])
    }
    ws.send(buffer)
  })

  ws.on('close', (err) => {
    close()
  })
})

server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname

  if (pathname === '/ws/input') {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request)
    })
  } else {
    socket.destroy()
  }
})

server.listen(5000)
