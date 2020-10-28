import { 
  SWITCH_APP, 
  SWITCH_DRAWER_APP, 
  TOGGLE_DRAWER,
  ADD_APP, 
  HANDLE_MIDI_BUFFER, 
  TOGGLE_MIDI_INPUT,
  SET_MIDI_DEVICES,
  TOGGLE_SEND_OUTPUT_EVENT,
  SET_THEME_ID,
  SET_APP_SPECIFIC_PERSISTENT_VALUE,
  SET_APP_SPECIFIC_SESSION_VALUE,
  TOGGLE_STATUS_BAR_VISIBILITY,
} from './actionTypes'

export const switchForegroundApp = appId => ({
  type: SWITCH_APP,
  payload: appId,
})

export const switchDrawerApp = appId => ({
  type: SWITCH_DRAWER_APP,
  payload: appId,
})

export const toggleDrawer = open => ({
  type: TOGGLE_DRAWER,
  payload: open,
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

export const sendCustomEvent = (deltaTime, msg, id, direction = 'input') => ({
  type: HANDLE_MIDI_BUFFER, 
  payload: {deltaTime, msg, source: {type: 'app', id}, direction},
})

export const toggleMidiInput = (input, isActive) => ({
  type: TOGGLE_MIDI_INPUT, 
  payload: {input, isActive},
})

export const setMidiDevices = (inputs, outputs) => ({
  type: SET_MIDI_DEVICES, 
  payload: {inputs, outputs},
})

export const toggleSendOutputEvent = send => ({
  type: TOGGLE_SEND_OUTPUT_EVENT, 
  payload: send,
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
export const toggleStatusBarVisibility = (appId, show) => ({
  type: TOGGLE_STATUS_BAR_VISIBILITY, 
  payload: {appId, show},
})
