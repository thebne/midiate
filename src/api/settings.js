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
    v =>  dispatch(setAppSpecificValue(appId, key, v))
  , [dispatch, appId, key])

  return useMemo(() =>
    [value === undefined ? defaultValue : value, setValue],
    [value, defaultValue, setValue])
}
