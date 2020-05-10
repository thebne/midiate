import { useMemo, useRef, useCallback } from 'react'
import { createSelector } from 'reselect'
import { useStore, useSelector } from 'react-redux'
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
    // needed for saving value in store
    const appId = useAppContext().id
    // cached selector
    const selector = useMemo(() => makeSelectorFn(appId, key),
      [appId, key])
    // direct access to store is needed to avoid loops in memoizing setValue
    const store = useStore()
    // get current value from store
    const value = useSelector(selector)
    // hack. useCallback compares by reference, but defaultValue shouldn't change
    const defaultRef = useRef(defaultValue)
    // memoize setValue to avoid re-renders 
    const setValue = useCallback(v => {
      // support running callbacks with most recent value
      if (typeof v === 'function') {
        const fresh = selector(store.getState())
        v = v(fresh === undefined ? defaultRef.current : fresh)
      }
      return store.dispatch(actionFn(appId, key, v))
    }, [selector, store, appId, key, defaultRef])

    // return [value,setValue] like useState
    return [value === undefined ? defaultValue : value, setValue]
  }

export const useSetting = makeUseValue(
  makeGetAppSpecificPersistentValue, setAppSpecificPersistentValue)
export const useSessionValue = makeUseValue(
  makeGetAppSpecificSessionValue, setAppSpecificSessionValue)
