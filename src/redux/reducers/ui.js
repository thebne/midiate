import { 
  SET_MIDI_DEVICES, 
  SWITCH_APP, 
  ADD_APP,
  SET_MIDI_SERVER_CONNECTION_STATUS,
  SET_APP_SPECIFIC_SESSION_VALUE,
} from "../actionTypes"

import { DEFAULT_APP_ID } from '../../constants'

const initialState = {
  midiInputs: [],
  midiOutputs: [],
  midiServerConnectionStatus: false,
  foregroundApp: DEFAULT_APP_ID,
  appIdToConfig: {},
  appSpecific: {},
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
    case SET_APP_SPECIFIC_SESSION_VALUE: {
      return {
        ...state,
        appSpecific: {
          ...state.appSpecific,
          [action.payload.appId]: {
            ...state.appSpecific[action.payload.appId],
            [action.payload.key]: action.payload.value,
          }
        },
      }
    }
    default: {
      return state
    }
  }
};

export default ui 
