import { 
  TOGGLE_MIDI_INPUT, 
  SET_MIDI_SERVER_HOST,
  SET_THEME_ID,
} from "../actionTypes"

const initialState = {
  midiInputs: [],
  midiInputsActive: {},
  midiServerHost: "",
  themeId: 0,
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
    default: {
      return state
    }
  }
};

export default settings
