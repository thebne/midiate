import { createSelector } from 'reselect'
import { Midi } from '@tonaljs/tonal'
import { detect } from '../utils/chords'

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

export const getThemeId = createSelector(
  [getSettingsState],
  settings => settings.themeId || 0
)

export const getChordDetectionRange = createSelector(
  [getSettingsState],
  settings => settings.chordDetectionRange || [null, null]
)

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
    i.active = isActive(i.id)
    return i
  })
)
export const getMidiOutputs = createSelector(
  [getUiState],
  (ui) => ui.midiOutputs || []
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

const filterNotes = (notes, [start, end]) => {
  const filtered = notes.notes.filter(n => {
    const midi = Midi.toMidi(n)
    return (start === null || midi >= start) && (end === null || midi <= end)
  })
  return {...notes, notes: filtered, detection: detect(filtered)}
}

const getLooseChords = createSelector(
  [getNotes, getChordDetectionRange],
  (notes, [start, end]) => filterNotes({notes, id: -1}, [start, end])
)
const getStrictChords = createSelector(
  [getStrictNotes, getChordDetectionRange],
  filterNotes
)
const getSmartChords = createSelector(
  [getSmartNotes, getChordDetectionRange],
  filterNotes
)

export const getChords = (store, config = {mode: "smart"}) => {
  switch (config.mode) {
    case 'loose':
      return getLooseChords(store)
    case 'strict':
      return getStrictChords(store)
    case 'smart':
      return getSmartChords(store)
    default:
      throw new Error(`unknown mode ${config.mode}`)
  }
}

export const getLastEvent = createSelector(
  [getEventsState],
  events => events.lastEvent
)
