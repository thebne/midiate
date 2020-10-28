import { useMemo } from 'react'
import { createSelector } from 'reselect'
import { useSelector, useDispatch } from 'react-redux'
import { sendCustomEvent, toggleSendOutputEvent } from '../redux/actions'
import { useConfig } from './context'

export const getEventsState = store => store.events
export const getLastEvent = createSelector(
  [getEventsState],
  events => events.lastInputEvent
)
export const getLastOutputEvent = createSelector(
  [getEventsState],
  events => events.lastOutputEvent
)
export const getShouldSendOutputEvent = createSelector(
  [getEventsState],
  events => events.shouldSendOutputEvent,
)



export const useLastEvent = (direction='input') => {
  const lastIn = useSelector(getLastEvent)
  const lastOut = useSelector(getLastOutputEvent)
  switch (direction) {
    case 'input':
      return lastIn
    case 'output':
      return lastOut
    default:
      throw new Error('unknown direction')
  }
}
export const useSendEvent = () => {
  const appId = useConfig().id
  const dispatch = useDispatch()
  return useMemo(() => {
    let lastTime = new Date().getTime()
    return (msg, direction) => {
      const now = new Date().getTime()
      dispatch(sendCustomEvent(now - lastTime, msg, appId, direction))
      lastTime = now
    }
  }, [dispatch, appId])
}

export const useToggleSendOutputEvent = () => {

  const dispatch = useDispatch()
  return useMemo(() => 
    send => dispatch(toggleSendOutputEvent(send))
  , [dispatch])
}

export const useShouldSendOutputEvent = () => useSelector(getShouldSendOutputEvent)
