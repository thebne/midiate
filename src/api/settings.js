import { useMemo, useCallback } from 'react'
import { createSelector } from 'reselect'
import { useSelector, useDispatch } from 'react-redux'
import { setAppSpecificSessionValue,
  setAppSpecificPersistentValue } from '../redux/actions'
import { useAppContext } from './context'

const getSettingsState = store => store.settings
const getAppSpecificPersistent = createSelector(
  [getSettingsState],
  settings => settings.appSpecific || {}
)
const makeGetAppSpecificPersistentValue = (appId, key) => {
  return createSelector(
    [getAppSpecificPersistent],
    appSpecific => (appSpecific[appId] || {})[key]
  )
}

const getUiState = store => store.ui
const getAppSpecificSession = createSelector(
  [getUiState],
  ui => ui.appSpecific || {}
)
const makeGetAppSpecificSessionValue = (appId, key) => {
  return createSelector(
    [getAppSpecificSession],
    appSpecific => (appSpecific[appId] || {})[key]
  )
}

const makeUseValue = (makeSelectorFn, actionFn) => 
  (key, defaultValue) => {
    const dispatch = useDispatch()
    const appId = useAppContext().id
    const value = useSelector(makeSelectorFn(appId, key))
    const setValue = useCallback(
      v =>  dispatch(actionFn(appId, key, v))
    , [dispatch, appId, key])

    return [value === undefined ? defaultValue : value, setValue]
  }

export const useSetting = makeUseValue(
  makeGetAppSpecificPersistentValue, setAppSpecificPersistentValue)
export const useSessionValue = makeUseValue(
  makeGetAppSpecificSessionValue, setAppSpecificSessionValue)
