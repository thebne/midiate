import { createSelector } from 'reselect'

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

export const getDrawerAppId = createSelector(
  [getUiState],
  ui => ui.drawerApp
)

export const getDrawerOpen = createSelector(
  [getUiState],
  ui => ui.drawerOpen
)

export const getApp = (store, appId) => 
  getApps(store)[appId] || {}

export const getThemeId = createSelector(
  [getSettingsState],
  settings => settings.themeId || 0
)

export const getMidiServerHost = createSelector(
  [getSettingsState],
  settings => settings.midiServerHost || ""
)

// Get the active state map directly for efficient lookups
export const getMidiInputsActiveMap = createSelector(
  [getSettingsState],
  settings => settings.midiInputsActive || {}
)

// Helper function (not a selector) to check if input is active
export const isInputActive = (activeMap, inputId) =>
  activeMap[inputId] !== undefined ? activeMap[inputId] : true

export const getMidiInputs = createSelector(
  [getUiState, getMidiInputsActiveMap],
  (ui, activeMap) => (ui.midiInputs || []).map(i => ({
    ...i,
    active: isInputActive(activeMap, i.id)
  }))
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

export const makeGetStatusBarVisiblity = appId => createSelector(
  [getUiState],
  ui => ui.appStatusBarVisibility[appId] === undefined 
    ? true : ui.appStatusBarVisibility[appId]
)
