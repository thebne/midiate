const http = require('http')
const WebSocket = require('ws')
const url = require('url')
const midi = require('midi')

const INSTRUMENT_NAME = "Roland Digital Piano:Roland Digital Piano MIDI 1 24:0"

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// wait for port to be present 
class RecoverableInput {
  constructor(name) {
    this.name = name
    this.callbacks = []
    this.isOpen = false
  }

  onMessage(callback) {
    this.callbacks.push(callback)
  }

  removeOnMessage(callback) {
    this.callbacks.splice(this.callbacks.indexOf(callback), 1)
    
    if (this.callbacks.length === 0) {
      this.close()
    }
  }

  callOnMessages(...params) {
    for (const callback of this.callbacks) {
      callback(...params)
    }
  }

  init() {
    this.close()

    this.input = new midi.Input()
    this.isOpen = false
    this.input.on('message', () => this.lastMessage = Date.now())
    this.input.on('message', this.callOnMessages.bind(this)) 
  }

  async find(name) {
    let names = []
    let prevCount = null
    while (!names.includes(name)) { 
      while (prevCount === this.input.getPortCount()) {
        await sleep(500)
      }
      prevCount = this.input.getPortCount()
      names = ([...Array(prevCount).keys()]
        .map(p => this.input.getPortName(p)))
    }
    return names.indexOf(name)
  }

  async open() {
    this.init()
    console.log('Input: waiting', this.name)
    this.input.openPort(await this.find(this.name))
    console.log('Input: opened', this.name)
    this.isOpen = true
  }

  close() {
    if (this.input && this.isOpen)
      this.input.closePort()
  }

  async start(timeoutMs = 10000) {
    if (this.isOpen)
      // someone already started it
      return

    try {
      // open for the first time
      await this.open()

      // save last input
      this.lastMessage = Date.now()
    } catch (e) {
      console.error("error opening port", e)
    }

    let opening = false 
    // check every few seconds 
    setInterval(() => {
      if (!opening && Date.now() - this.lastMessage > timeoutMs) {
        // try restoring the connection, maybe it's lost
        opening = true
        this.open().then(() => {
          console.log('Input: restored', this.name)
          opening = false
          this.lastMessage = Date.now()
        }, (e) => {
          console.error("error opening port", e)
          opening = false
        })
      }
    }, 500)
  }
}

const input = new RecoverableInput(INSTRUMENT_NAME)

const server = http.createServer()
const wss = new WebSocket.Server({ noServer: true })

wss.on('connection', async (ws) => {
  const msgCallback = (deltaTime, message) => {
    const buffer = new ArrayBuffer(11)
    const view = new DataView(buffer)
    view.setFloat64(0, deltaTime)
    for (let i = 0; i < message.length; ++i) {
      view.setUint8(8 + i, message[i])
    }
    ws.send(buffer)
  } 

	input.onMessage(msgCallback)

  ws.on('close', (err) => {
    input.removeOnMessage(msgCallback)
  })

  input.start()
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
