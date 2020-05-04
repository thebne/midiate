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

export const getApp = (store, appId) => 
  getApps(store)[appId] || {}

export const getAppConfig = (store, appId) => 
  getApp(store, appId).config || {}

export const getThemeId = createSelector(
  [getSettingsState],
  settings => settings.themeId || 0
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

export const makeGetNotes = (config={}) => {
  const {mode="loose", data="simple"} = config
  const noteSelector = (() => {
    switch (mode) {
      case 'loose':
        return getLooseNotes
      case 'smart':
        return getSmartNotes
      default:
        throw new Error(`unknown mode ${mode}`)
    }})()

  return createSelector(
    [noteSelector],
    notes => {
      switch (data) {
        case 'simple':
          if (mode === 'smart') {
            return {
              ...notes,
              events: notes.events.map(e => e.note)
            }
          }
          return notes.map(e => e.note)
        case 'extended':
          return notes
        default:
          throw new Error(`unknown data type ${data}`)
      }
    }
  )
}

const getLooseNotes = createSelector(
  [getEventsState],
  events => events.notes || []
)

const getSmartNotes = createSelector(
  [getEventsState],
  events => events.smartNotes
)

export const getLastEvent = createSelector(
  [getEventsState],
  events => events.lastEvent
)
