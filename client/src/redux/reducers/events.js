import { HANDLE_MIDI_EVENT } from "../actionTypes"
import { Midi } from "@tonaljs/tonal"

var MIDIMessage = require('midimessage')

const initialState = {
  currentByChannel: {},
  lastEvent: null,
}

function parseMessage(rawMsg) {
  let msg = MIDIMessage({data: new Uint8Array(rawMsg)})
  if (msg.key !== undefined) {
    msg.note = Midi.midiToNoteName(msg.key)
    msg.freq = Midi.midiToFreq(msg.key)
  }
  return msg
}

const events = (state = initialState, action) => {
  switch (action.type) {
    case HANDLE_MIDI_EVENT: {
      let event = parseMessage(action.payload)
      let stateData = {lastEvent: event}

      switch (event.messageType) {
        case 'noteon': {
          stateData.currentByChannel = {
            ...state.currentByChannel,
            [event.channel]: (state.currentByChannel[event.channel] || []).concat(event.note)
          }
          break
        }
        case 'noteoff': {
          stateData.currentByChannel = {
            ...state.currentByChannel,
            [event.channel]: (state.currentByChannel[event.channel] || []).filter(n => n !== event.note)
          }
          break
        }
        default:
          
      }
      return {
        ...state,
        ...stateData
      }
    }
    default: {
      return state
    }
  }
}

export default events

