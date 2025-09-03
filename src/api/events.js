import React, { useState, useCallback, useContext, useEffect } from 'react'
import { parseMessage } from '../utils/midi'

const EventsContext = React.createContext({ lastEvent: null, sendEvent: () => {} })

export const MidiProvider = ({ children }) => {
  const [lastEvent, setLastEvent] = useState(null)

  const sendEvent = useCallback((msg) => {
    setLastEvent(msg)
  }, [])

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      return
    }
    let isActive = true
    let lastTime = performance.now()
    let inputs = []

    navigator.requestMIDIAccess().then(access => {
      inputs = Array.from(access.inputs.values())
      inputs.forEach(input => {
        input.onmidimessage = e => {
          if (!isActive) {
            return
          }
          const msg = parseMessage(e.data, e.timeStamp - lastTime)
          lastTime = e.timeStamp
          sendEvent(msg)
        }
      })
    })

    return () => {
      isActive = false
      inputs.forEach(input => {
        if (input) {
          input.onmidimessage = null
        }
      })
    }
  }, [sendEvent])

  const value = { lastEvent, sendEvent }
  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  )
}

export const useLastEvent = () => useContext(EventsContext).lastEvent
export const useSendEvent = () => useContext(EventsContext).sendEvent
