import { useCallback } from 'react'
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
  return useCallback(
    (deltaTime, msg) => dispatch(sendCustomEvent(deltaTime, msg, appId)),
    [dispatch, appId]
  )
}
