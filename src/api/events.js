import { useMemo } from 'react'
import { createSelector } from 'reselect'
import { useSelector, useDispatch } from 'react-redux'
import { sendCustomEvent } from '../redux/actions'
import { useConfig } from './context'

export const getEventsState = store => store.events
export const getLastEvent = createSelector(
  [getEventsState],
  events => events.lastEvent
)

export const useLastEvent = () => useSelector(getLastEvent)
export const useSendEvent = () => {
  const appId = useConfig().id
  const dispatch = useDispatch()
  return useMemo(() => {
    let lastTime = Date.now()
    return (msg) => {
      const now = Date.now()
      dispatch(sendCustomEvent(now - lastTime, msg, appId))
      lastTime = now
    }
  }, [dispatch, appId])
}
