import { Midi } from "@tonaljs/tonal"

var MIDIMessage = require('midimessage')

class EventHandler {
  constructor() {
    // catch raw events and transform them to rich ones
    window.addEventListener('server-midi-raw', this.onServerMidiRawEvent)
  }

  onServerMidiRawEvent = async (event) => {
    let msg = MIDIMessage({data: new Uint8Array(event.detail)})
    enrichMessage(msg)

    window.dispatchEvent(new CustomEvent('server-midi', {detail: msg}))
  }
}

function enrichMessage(msg) {
    if (msg.key !== undefined) {
      msg.note = Midi.midiToNoteName(msg.key)
      msg.freq = Midi.midiToFreq(msg.key)
    }
}

export default EventHandler
