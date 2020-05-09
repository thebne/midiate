import { SET_MIDI_DEVICES, SWITCH_APP, ADD_APP,
  SET_MIDI_SERVER_CONNECTION_STATUS
} from "../actionTypes"

import { DEFAULT_APP_ID } from '../../constants'

const initialState = {
  midiInputs: [],
  midiOutputs: [],
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
          [action.payload.appId]: action.payload.config
        }
      }
    }
    case SET_MIDI_DEVICES: {
      return {
        ...state,
        midiInputs: action.payload.inputs,
        midiOutputs: action.payload.outputs,
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
