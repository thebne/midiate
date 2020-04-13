import { SWITCH_APP, ADD_APP, 
  HANDLE_MIDI_EVENT, DETECT_STRICT_NOTES } from './actionTypes'

export const switchForegroundApp = appId => ({
  type: SWITCH_APP,
  payload: appId,
})

export const addApp = (appId, config) => ({
  type: ADD_APP,
  payload: {appId, config},
})

export const handleMidiEvent  = buffer => ({
  type: HANDLE_MIDI_EVENT, 
  payload: buffer,
})

export const detectStrictNotes = notes => ({
  type: DETECT_STRICT_NOTES, 
  payload: notes,
})
