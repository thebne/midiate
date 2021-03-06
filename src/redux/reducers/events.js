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
      const { msg, source, deltaTime } = action.payload
      const event = parseMessage(msg, deltaTime)
      event.source = source
      if (!event.receivedTime) {
        event.receivedTime = new Date().getTime()
      }

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

