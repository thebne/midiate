import { 
  HANDLE_MIDI_BUFFER, 
  DETECT_STRICT_NOTES,
} from "../actionTypes"
import { detectStrictNotes } from "../actions"
import store from '../store'

import { parseMessage } from '../../utils/midi'

const initialState = {
  notes: [],
  smartNotes: {
    notes: [],
    id: 0,
  },
  strictNotes: {
    notes: [],
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
      // try to make a more strict guess
      const strictNotes = getStrictNotes(stateChanges)
      if (strictNotes) {
        stateChanges.strictNotes = strictNotes
      }

      return stateChanges
    }

    case DETECT_STRICT_NOTES: { 
      return {
        ...state,
        strictNotes: action.payload
      }
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

const getSmartNotes = (state, stateChanges) => {
  const {lastEvent} = stateChanges

  switch (lastEvent.messageType) {
    case 'noteon': 
    case 'noteoff': {
      const prevId = state.smartNotes.id
      // handle alteration of current notes
      if (state.smartNotes.notes.length) {
        if (stateChanges.notes.length === 0) {
        // all notes removed
          return {
            notes: [],
            id: prevId + 1,
          }
        }
        else if (isSubset(stateChanges.notes, state.notes)) {
          // notes were removed, but not all - not a new detection
          return state.smartNotes
        } else {
          return {
            notes: stateChanges.notes,
            id: prevId, 
          }
        }
      }

      return {
        notes: stateChanges.notes,
        id: prevId + 1,
      }
    }
    default:
  }
  return state.smartNotes
}

let strictTimeout = null
function getStrictNotes({smartNotes}) {
  // clear any previous timeout for strict detection
  if (strictTimeout)
    clearTimeout(strictTimeout)

  // if current detection is empty, it's safe to assume the strict detection should also be 
  if (!smartNotes.notes.length) {
    return smartNotes
  }
  
  // otherwise only set it when enough time had passed
  strictTimeout = setTimeout(() => {
    // make sure store didn't change in any way
    if (store.getState().events.smartNotes.id !== smartNotes.id)
      return
    store.dispatch(detectStrictNotes(smartNotes))
  }, 100)
  return
}

// is a subset of b
const isSubset = (a, b) => a.every(val => b.includes(val))

export default events

