import { SET_MIDI_INPUTS, SWITCH_APP, STOP_APP, ADD_APP,
  SET_MIDI_SERVER_CONNECTION_STATUS
} from "../actionTypes"

const initialState = {
  midiInputs: [],
  midiServerConnectionStatus: false,
  foregroundApp: null,
  runningApps: [],
  appIdToName: {},
}

const ui = (state = initialState, action) => {
  switch (action.type) {
    case SWITCH_APP: {
      return {
        ...state,
        foregroundApp: action.payload,
      }
    }
    case STOP_APP: {
      state.runningAppPids.pop(action.payload)
      if (action.payload === state.foregroundApp) {
        state.foregroundApp = null
      }
      return state
    }
    case ADD_APP: {
      return {
        ...state,
         runningApps: [...state.runningApps, action.payload],
        appIdToName: {
          ...state.appIdToName,
          [action.payload.appId]: action.payload.name
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
