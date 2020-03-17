import { SWITCH_APP, STOP_APP, ADD_APP } from "../actionTypes"

// TODO move to chord app
import { SET_CURRENT_CHANNEL } from "../actionTypes"

const initialState = {
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
    // TODO move to chord app
    case SET_CURRENT_CHANNEL: {
      return {
        ...state,
       specific: {
         ...state.specific,
         [action.payload.appId]: {
           ...state.specific[action.payload.appId],
           currentChannel: action.payload.channel
         }
       }
      }
    }

    default: {
      return state
    }
  }
};

export default ui 
