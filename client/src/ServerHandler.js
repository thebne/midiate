import { Midi } from "@tonaljs/tonal"

var MIDIMessage = require('midimessage')

class ServerHandler {
  constructor(host) {
    this.socket = new WebSocket(`ws://${host}/ws/input`)

    this.socket.onmessage = (event) => {
      event.data.arrayBuffer().then(buffer => {
        // dispatch raw event
        let msg = MIDIMessage({data: new Uint8Array(buffer)})
        if (msg.key !== undefined) {
          msg.note = Midi.midiToNoteName(msg.key)
          msg.freq = Midi.midiToFreq(msg.key)
        }
        window.dispatchEvent(new CustomEvent('server-midi', {detail: msg}))
      })
    }
  }
}
export default ServerHandler
