import { 
  TOGGLE_MIDI_INPUT, 
  SET_MIDI_SERVER_HOST,
  SET_THEME_ID,
  SET_CHORD_DETECTION_RANGE,
} from "../actionTypes"

const initialState = {
  midiInputs: [],
  midiInputsActive: {},
  midiServerHost: "",
  themeId: 0,
  chordDetectionRange: [null, null],
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
    case SET_CHORD_DETECTION_RANGE: {
      return {
        ...state,
        chordDetectionRange: [action.payload.start, action.payload.end],
      }
    }
    default: {
      return state
    }
  }
};

export default settings
