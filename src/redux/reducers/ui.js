import { 
  SET_MIDI_DEVICES, 
  SWITCH_APP, 
  ADD_APP,
  SET_MIDI_SERVER_CONNECTION_STATUS,
  SET_APP_SPECIFIC_SESSION_VALUE,
  TOGGLE_STATUS_BAR_VISIBILITY,
} from "../actionTypes"

import { DEFAULT_APP_ID } from '../../constants'

const initialState = {
  // array of WebMIDI inputs
  midiInputs: [],
  // array of WebMIDI outputs
  midiOutputs: [],
  // connected to remote?
  midiServerConnectionStatus: false,
  // current app that is presented
  foregroundApp: DEFAULT_APP_ID,
  // config mapping
  appIdToConfig: {},
  // per-app persistent config
  appSpecific: {},
  // app-controlled status bar visibility
  appStatusBarVisibility: {},
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
    case TOGGLE_STATUS_BAR_VISIBILITY: {
      return {
        ...state,
        appStatusBarVisibility: {
          ...state.appStatusBarVisibility,
          [action.payload.appId]: action.payload.show,
        },
      }
    }
    default: {
      return state
    }
  }
};

export default ui 
