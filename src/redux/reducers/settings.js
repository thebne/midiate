import { 
  TOGGLE_MIDI_INPUT, 
  SET_MIDI_SERVER_HOST,
  SET_THEME_ID,
  SET_APP_SPECIFIC_VALUE,
} from "../actionTypes"

const initialState = {
  midiInputs: [],
  midiInputsActive: {},
  midiServerHost: "",
  themeId: 0,
  appSpecific: {},
}

const settings = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_MIDI_INPUT: {
      const {input, isActive} = action.payload
      return {
        ...state,
        midiInputsActive: {
          ...state.midiInputsActive,
          [input]: isActive,
        }
      }
    }
    case SET_MIDI_SERVER_HOST: {
      return {
        ...state,
        midiServerHost: action.payload
      }
    }
    case SET_THEME_ID: {
      return {
        ...state,
        themeId: action.payload
      }
    }
    case SET_APP_SPECIFIC_VALUE: {
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

export default settings
