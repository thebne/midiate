import { SET_MIDI_INPUTS, SWITCH_APP, ADD_APP,
  SET_MIDI_SERVER_CONNECTION_STATUS
} from "../actionTypes"

import { DEFAULT_APP_ID } from '../../constants'

const initialState = {
  midiInputs: [],
  midiServerConnectionStatus: false,
  foregroundApp: DEFAULT_APP_ID,
  appIdToConfig: {},
}

const ui = (state = initialState, action) => {
  switch (action.type) {
    case SWITCH_APP: {
      return {
        ...state,
        foregroundApp: action.payload,
      }
    }
    case ADD_APP: {
      return {
        ...state,
        appIdToConfig: {
          ...state.appIdToConfig,
          [action.payload.appId]: action.payload
        }
      }
    }
    case SET_MIDI_INPUTS: {
      return {
        ...state,
        midiInputs: action.payload,
      }
    }
    case SET_MIDI_SERVER_CONNECTION_STATUS: {
      return {
        ...state,
        midiServerConnectionStatus: action.payload,
      }
    }

    default: {
      return state
    }
  }
};

export default ui 
