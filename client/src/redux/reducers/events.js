import { 
  HANDLE_MIDI_BUFFER, 
} from "../actionTypes"

import { parseMessage } from '../../utils/midi'

const initialState = {
  notes: [],
  smartNotes: {
    events: [],
    id: 0,
  },
  lastEvent: null,
}

const events = (state = initialState, action) => {  
  switch (action.type) {	    
    case HANDLE_MIDI_BUFFER: {		
      const event = parseMessage(action.payload.msg, action.payload.deltaTime)
      event.source = action.payload.source

      let stateChanges = {...state}

      // pass lastEvent as parameter
      stateChanges.lastEvent = event

      // find notes by events state
      stateChanges.notes = getNotes(state, stateChanges)

      // deduce notes in a stateful manner (respect time)
      stateChanges.smartNotes = getSmartNotes(state, stateChanges)

      return stateChanges
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
      return state.notes.concat({...lastEvent})
    }
    case 'noteoff': {
      return state.notes.filter(n => n.key !== lastEvent.key)
    }
    default:
  }
  return state.notes
}

const getSmartNotes = (state, stateChanges) => {
  const {lastEvent} = stateChanges

  switch (lastEvent.messageType) {
    case 'noteon': 
    case 'noteoff': {
      const prevId = state.smartNotes.id
      const prevNotes = state.notes.map(e => e.key)
      const nextNotes = stateChanges.notes.map(e => e.key)

      // handle alteration of current notes
      if (state.smartNotes.events.length) {
        if (nextNotes.length === 0) {
        // all notes removed
          return {
            events: [],
            id: prevId + 1,
          }
        }
        else if (isSubset(nextNotes, prevNotes)) {
          // notes were removed, but not all - not a new detection
          return state.smartNotes
        } else {
          return {
            events: [...stateChanges.notes],
            id: prevId, 
          }
        }
      }

      return {
        events: [...stateChanges.notes],
        id: prevId + 1,
      }
    }
    default:
  }
  return state.smartNotes
}

// is a subset of b
const isSubset = (a, b) => a.every(val => b.includes(val))

export default events

