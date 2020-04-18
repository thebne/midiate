import { 
  SWITCH_APP, 
  ADD_APP, 
  HANDLE_MIDI_EVENT, 
  DETECT_STRICT_NOTES,
  TOGGLE_MIDI_INPUT,
  SET_MIDI_INPUTS,
  SET_MIDI_SERVER_HOST,
  SET_MIDI_SERVER_CONNECTION_STATUS,
} from './actionTypes'

export const switchForegroundApp = appId => ({
  type: SWITCH_APP,
  payload: appId,
})

export const addApp = (appId, config) => ({
  type: ADD_APP,
  payload: {appId, config},
})

export const handleMidiEvent  = (deltaTime, msg) => ({
  type: HANDLE_MIDI_EVENT, 
  payload: {deltaTime, msg},
})

export const detectStrictNotes = notes => ({
  type: DETECT_STRICT_NOTES, 
  payload: notes,
})

export const toggleMidiInput = (input, isActive) => ({
  type: TOGGLE_MIDI_INPUT, 
  payload: {input, isActive},
})

export const setMidiInputs = inputs => ({
  type: SET_MIDI_INPUTS, 
  payload: inputs,
})

export const setMidiServerHost = host => ({
  type: SET_MIDI_SERVER_HOST, 
  payload: host,
})

export const setMidiServerConnectionStatus = status => ({
  type: SET_MIDI_SERVER_CONNECTION_STATUS, 
  payload: status,
})
