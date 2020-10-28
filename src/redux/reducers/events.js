import { 
  HANDLE_MIDI_BUFFER, 
  TOGGLE_SEND_OUTPUT_EVENT,
} from "../actionTypes"

import { parseMessage } from '../../utils/midi'

const initialState = {
  lastInputEvent: null,
  lastOutputEvent: null,
  shouldSendOutputEvent: true,
}

const events = (state = initialState, action) => {  
  switch (action.type) {	    
    case HANDLE_MIDI_BUFFER: {		
      const { msg, source, direction = 'input', deltaTime } = action.payload
      const event = parseMessage(msg, deltaTime)
      event.source = source
      if (!event.receivedTime) {
        event.receivedTime = new Date().getTime()
      }

      let eventType
      switch (direction) {
        case 'input':
          eventType = 'lastInputEvent'
          break
        case 'output':
          // don't send if sendOutputEvent is toggled off
          if (!state.shouldSendOutputEvent)
            return state
          eventType = 'lastOutputEvent'
          break
        default:
          throw new Error(`Unknown direction ${direction}`)
      }

      return {
        ...state,
       [eventType]: event,
      }
    }

    case TOGGLE_SEND_OUTPUT_EVENT: {
      return {
        ...state,
        shouldSendOutputEvent: action.payload, 
      }
    }
      
    default: {
      return state
    }
  }
}

export default events

