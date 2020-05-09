import { 
  SWITCH_APP, 
  ADD_APP, 
  HANDLE_MIDI_BUFFER, 
  TOGGLE_MIDI_INPUT,
  SET_MIDI_DEVICES,
  SET_MIDI_SERVER_HOST,
  SET_MIDI_SERVER_CONNECTION_STATUS,
  SET_THEME_ID,
  SET_APP_SPECIFIC_PERSISTENT_VALUE,
  SET_APP_SPECIFIC_SESSION_VALUE,
} from './actionTypes'

export const switchForegroundApp = appId => ({
  type: SWITCH_APP,
  payload: appId,
})

export const addApp = (appId, config) => ({
  type: ADD_APP,
  payload: {appId, config},
})

export const sendMidiEvent  = (deltaTime, msg, id, name) => ({
  type: HANDLE_MIDI_BUFFER, 
  payload: {deltaTime, msg, source: {type: 'midi', id, name}},
})

export const sendKeyboardEvent  = (deltaTime, msg) => ({
  type: HANDLE_MIDI_BUFFER, 
  payload: {deltaTime, msg, source: {type: 'keyboard'}},
})

export const sendServerEvent = (deltaTime, msg, host) => ({
  type: HANDLE_MIDI_BUFFER, 
  payload: {deltaTime, msg, source: {type: 'server', host}},
})

export const sendCustomEvent = (deltaTime, msg, id) => ({
  type: HANDLE_MIDI_BUFFER, 
  payload: {deltaTime, msg, source: {type: 'app', id}},
})

export const toggleMidiInput = (input, isActive) => ({
  type: TOGGLE_MIDI_INPUT, 
  payload: {input, isActive},
})

export const setMidiDevices = (inputs, outputs) => ({
  type: SET_MIDI_DEVICES, 
  payload: {inputs, outputs},
})

export const setMidiServerHost = host => ({
  type: SET_MIDI_SERVER_HOST, 
  payload: host,
})

export const setMidiServerConnectionStatus = status => ({
  type: SET_MIDI_SERVER_CONNECTION_STATUS, 
  payload: status,
})

export const setThemeId = id => ({
  type: SET_THEME_ID, 
  payload: id,
})

export const setAppSpecificPersistentValue = (appId, key, value) => ({
  type: SET_APP_SPECIFIC_PERSISTENT_VALUE, 
  payload: {appId, key, value},
})
export const setAppSpecificSessionValue = (appId, key, value) => ({
  type: SET_APP_SPECIFIC_SESSION_VALUE, 
  payload: {appId, key, value},
})
