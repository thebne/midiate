import { useMemo, useRef, useCallback } from 'react'
import { createSelector } from 'reselect'
import { useStore, useSelector, useDispatch } from 'react-redux'
import { 
  setAppSpecificSessionValue,
  setAppSpecificPersistentValue,
  toggleStatusBarVisibility,
} from '../redux/actions'
import { useConfig } from './context'

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
    const appId = useConfig().id
    // cached selector
    const selector = useMemo(() => makeSelectorFn(appId, key),
      [appId, key])
    // direct access to store is needed to avoid loops in memoizing setValue
    const store = useStore()
    // get current value from store
    const value = useSelector(selector)
    // hack. useCallback compares by reference, but defaultValue shouldn't change
    //. see https://github.com/facebook/react/issues/14476
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
    return [value === undefined ? defaultRef.current : value, setValue]
  }

export const useSetting = makeUseValue(
  makeGetAppSpecificPersistentValue, setAppSpecificPersistentValue)
export const useSessionValue = makeUseValue(
  makeGetAppSpecificSessionValue, setAppSpecificSessionValue)

// toggling show/hide in status bar
export const useToggleStatusBarVisibility = () => {
  const appId = useConfig().id
  const dispatch = useDispatch()
  return useCallback((v) => 
    dispatch(toggleStatusBarVisibility(appId, v))
  , [appId, dispatch])
}
