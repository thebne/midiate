import { TOGGLE_MIDI_INPUT, SET_MIDI_SERVER_HOST } from "../actionTypes"

const initialState = {
  midiInputs: [],
  midiInputsActive: {},
  midiServerHost: "",
  appSettings: {},
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
    default: {
      return state
    }
  }
};

export default settings
