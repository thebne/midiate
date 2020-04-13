import { Midi } from "@tonaljs/tonal"
const MIDIMessage = require('midimessage')

export function parseMessage(rawMsg) {
  let msg = MIDIMessage({data: new Uint8Array(rawMsg)})
  // enrich with note and frequency
  if (msg.key !== undefined) {
    msg.note = Midi.midiToNoteName(msg.key)
    msg.freq = Midi.midiToFreq(msg.key)
  }
  // treat note_on with velocity=0 as note_off
  if (msg.messageType === 'noteon' && msg.velocity === 0) {
    msg.messageType = 'noteoff'
  }
  return msg
}
