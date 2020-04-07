export const getUiState = store => store.ui

export const getRunningApps = store => getUiState(store) ? getUiState(store).runningApps : {}
export const getForegroundAppId = (store) => getUiState(store) ? getUiState(store).foregroundApp : null
export const getApp = (store, appId) => getRunningApps(store)[appId] || {}

// getCurrently's only support one channel
export const getCurrentlyPlayed = store => store.events.notes || []
export const getCurrentChords = store => store.events.chords || {detection: null, id: 0}

export const getLastEvent = store => store.events.lastEvent
export const getAppConfig = (store, appId) => getApp(store, appId).config || {}
