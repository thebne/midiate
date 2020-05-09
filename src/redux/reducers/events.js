import { 
  HANDLE_MIDI_BUFFER, 
} from "../actionTypes"

import { parseMessage } from '../../utils/midi'

const initialState = {
  lastEvent: null,
}

const events = (state = initialState, action) => {  
  switch (action.type) {	    
    case HANDLE_MIDI_BUFFER: {		
      const event = parseMessage(action.payload.msg, action.payload.deltaTime)
      event.source = action.payload.source
      return {
        ...state,
        lastEvent: event,
      }
    }
      
    default: {
      return state
    }
  }
}

export default events

