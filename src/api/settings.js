import { useMemo, useEffect, useCallback } from 'react'
import { createSelector } from 'reselect'
import { useSelector, useDispatch } from 'react-redux'
import { setAppSpecificValue } from '../redux/actions'
import { useAppContext } from './context'

const getSettingsState = store => store.settings
const getAppSpecificSettings = createSelector(
  [getSettingsState],
  settings => settings.appSpecific || {}
)
const makeGetAppSpecificValue = (appId, key) => {
  return createSelector(
    [getAppSpecificSettings],
    appSpecific => (appSpecific[appId] || {})[key]
  )
}

export const useSetting = (key, defaultValue) => {
  const dispatch = useDispatch()
  const appId = useAppContext().id
  const selector = useMemo(() => makeGetAppSpecificValue(appId, key),
    [appId, key])
  const value = useSelector(selector)
  const setValue = useCallback(
    v => {
      if (typeof v === 'function') {
        v = v(value)
        if (v === value)
          return
      }
      return dispatch(setAppSpecificValue(appId, key, v))
    }
  , [dispatch, appId, key/*, value - causes infinite loop FIXME */])
  // set for first time
  useEffect(() => {
    setValue(oldValue => {
      if (oldValue === undefined && defaultValue !== undefined) {
        return defaultValue
      }
      return oldValue
    })
  }, [setValue, defaultValue])

  return [value === undefined ? defaultValue : value, setValue]
}
