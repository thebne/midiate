import { detect } from '../utils/chords'

export const getUiState = store => store.ui
export const getRunningApps = store => getUiState(store) ? getUiState(store).runningApps : {}
export const getForegroundAppId = (store) => getUiState(store) ? getUiState(store).foregroundApp : null
export const getApp = (store, appId) => getRunningApps(store)[appId] || {}

// get's only support one channel
export const getNotes = store => store.events.notes || []
export const getChords = (store, config = {mode: "smart"}) => {
  let notes
  switch (config.mode) {
    case 'loose':
      notes = {notes: store.events.notes, id: -1}
      break
    case 'strict':
      notes = store.events.strictNotes
      break
    case 'smart':
    default:
      notes = store.events.smartNotes
      break
  }
  if (!notes) {
    return {detection: null, notes: [], id: 0}
  }
  const detection = notes.notes.length ? detect(notes.notes) : null
  return {
    ...notes,
    detection,
  }
}

export const getLastEvent = store => store.events.lastEvent
export const getAppConfig = (store, appId) => getApp(store, appId).config || {}

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
