import { createSelector } from 'reselect'
import { detect } from '../utils/chords'
import { DEFAULT_APP_ID } from '../constants'

export const getUiState = store => store.ui
export const getSettingsState = store => store.settings
export const getEventsState = store => store.events

export const getApps = createSelector(
  [getUiState],
  ui => ui.appIdToConfig || {}
)

export const getForegroundAppId = createSelector(
  [getUiState],
  ui => ui.foregroundApp
)

export const getApp = (store, appId) => 
  getApps(store)[appId] || {}

export const getAppConfig = (store, appId) => 
  getApp(store, appId).config || {}


export const getMidiServerHost = createSelector(
  [getSettingsState],
  settings => settings.midiServerHost || ""
)

export const isMidiInputActive = createSelector(
  [getSettingsState],
  settings => {
    return input => settings.midiInputsActive[input] !== undefined 
      ? settings.midiInputsActive[input] : true
  }
)

export const getMidiInputs = createSelector(
  [getUiState, isMidiInputActive],
  (ui, isActive) => (ui.midiInputs || []).map(i => {
    i.active = isActive(i.name)
    return i
  })
)
export const getIsAnyMidiInputActive = createSelector(
  [getMidiInputs, getMidiServerHost],
  (inputs, serverHost) => serverHost.length || inputs.some(i => i.active)
)

export const getMidiServerConnectionStatus = createSelector(
  [getUiState],
  ui => ui.midiServerConnectionStatus
)

export const getNotes = createSelector(
  [getEventsState],
  events => events.notes || []
)

const getStrictNotes = createSelector(
  [getEventsState],
  events => events.strictNotes
)

const getSmartNotes = createSelector(
  [getEventsState],
  events => events.smartNotes
)

const getLooseChords = createSelector(
  [getNotes],
  notes => ({notes, id: -1, detection: detect(notes)})
)
const getStrictChords = createSelector(
  [getStrictNotes],
  notes => ({...notes, detection: detect(notes.notes)})
)
const getSmartChords = createSelector(
  [getSmartNotes],
  notes => ({...notes, detection: detect(notes.notes)})
)

export const getChords = (store, config = {mode: "smart"}) => {
  switch (config.mode) {
    case 'loose':
      return getLooseChords(store)
    case 'strict':
      return getStrictChords(store)
    case 'smart':
      return getSmartChords(store)
  }
  throw new Error(`unknown mode ${config.mode}`)
}

export const getLastEvent = createSelector(
  [getEventsState],
  events => events.lastEvent
)

// deprecated functions
export const getCurrentlyPlayed = store => {
  if (!getCurrentlyPlayed.reportedDeprecated) {
    console.warn('selector getCurrentlyPlayed() is deprecated and will be removed in next major release, use getNotes() instead')
    getCurrentlyPlayed.reportedDeprecated = true
  }
  return getNotes(store)
}
getCurrentlyPlayed.reportedDeprecated = false

export const getCurrentChords = store => {
  if (!getCurrentChords.reportedDeprecated) {
    console.warn('selector getCurrentChords() is deprecated and will be removed in next major release, use getChords() instead')
    getCurrentChords.reportedDeprecated = true
  }
  return getChords(store)
}
getCurrentChords.reportedDeprecated = false
