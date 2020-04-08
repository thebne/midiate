import { HANDLE_MIDI_EVENT } from "../actionTypes"
import { Midi } from "@tonaljs/tonal"
import { detect } from "@tonaljs/chord-detect"

var MIDIMessage = require('midimessage')

const initialState = {
  notes: [],
  chords: {
    detection: null,
    id: 0,
  },
  chordsRawDetection: [],
  lastEvent: null,
}

function detectChord(notes) {
  const current = notes.sort((n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
  return detect(current)
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

      let stateChanges = {...state}
      stateChanges.lastEvent = event
      stateChanges.notes = getNotes(state, stateChanges)
      stateChanges.chords = getChords(state, stateChanges)
      // TODO stateChanges.chordsRawDetection = detectChord(stateChanges.notes)

      return {...state, ...stateChanges}
    }
      
    default: {
      return state
    }
  }
}

const getNotes = (state, stateChanges) => {
  const {lastEvent} = stateChanges
  switch (lastEvent.messageType) {
    case 'noteon': {
      return state.notes.concat(lastEvent.note)
    }
    case 'noteoff': {
      return state.notes.filter(n => n !== lastEvent.note)
    }
    default:
  }
  return state.notes
}

const getChords = (state, stateChanges) => {
  const {lastEvent} = stateChanges

  switch (lastEvent.messageType) {
    case 'noteon': 
    case 'noteoff': {
      // handle alteration of current chord
      if (state.chords.detection) {
        if (stateChanges.notes.length === 0) {
        // all notes removed
          return {
            detection: null,
            id: state.chords.id + 1,
          }
        }
        else if (isSubset(stateChanges.notes, state.notes)) {
          // notes were removed, but not all - not a new detection
          return state.chords
        } else {
          // new notes were added - don't treat as new detection
          const detection = detectChord(stateChanges.notes)
          if (detection.length) {
            // new detection
            return {
              detection: detectChord(stateChanges.notes),
              id: state.chords.id, 
            }
          }
          return state.chords
        }
      }

      const detection = detectChord(stateChanges.notes)
      if (detection.length) {
        // new detection
        return {
          detection: detection,
          id: state.chords.id + 1, 
        }
      }
      return {
        detection: null,
        id: state.chords.id, 
      }
    }
    default:
  }
  return state.chords
}

// is a subset of b
const isSubset = (a, b) => a.every(val => b.includes(val))

export default events

