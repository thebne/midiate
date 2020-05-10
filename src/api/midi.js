import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'

const getUiState = store => store.ui
const getSettingsState = store => store.settings

const getMidiOutputs = createSelector(
  [getUiState],
  (ui) => ui.midiOutputs || []
)
export const useMidiOutputs = () => useSelector(getMidiOutputs)

const getMidiInputs = createSelector(
  [getUiState, getSettingsState],
  (ui, settings) => (ui.midiInputs || []).map(i => {
    i.active = settings.midiInputsActive[i.id] !== undefined 
      ? settings.midiInputsActive[i.id] : false
    return i
  })
)

export const useMidiInputs = () => useSelector(getMidiInputs)
export const useMidiInput = (name) => useSelector(createSelector(
  [getMidiInputs],
  (inputs) => inputs.filter(i => i.name === name)[0]
))
