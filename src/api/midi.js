import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'

export const getUiState = store => store.ui
export const useMidiOutputs = () => useSelector(createSelector(
  [getUiState],
  (ui) => ui.midiOutputs || []
))
