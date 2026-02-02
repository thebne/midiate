import { useMemo, useState, useEffect, useRef } from 'react'
import { useLastEvent } from './events'

export const useNotes = (config={}) => {
  const {data='simple'} = config
  const lastEvent = useLastEvent()
  const [notes, setNotes] = useState([])
  // Use a Set for O(1) key lookups
  const activeKeysRef = useRef(new Set())

  useEffect(() => {
    if (!lastEvent) {
      return
    }
    const activeKeys = activeKeysRef.current

    switch (lastEvent.messageType) {
      case 'noteon':
        if (!activeKeys.has(lastEvent.key)) {
          activeKeys.add(lastEvent.key)
          setNotes(notes => [...notes, {...lastEvent}])
        }
        break

      case 'noteoff':
        if (activeKeys.has(lastEvent.key)) {
          activeKeys.delete(lastEvent.key)
          setNotes(notes => notes.filter(n => n.key !== lastEvent.key))
        }
        break

      default:
        break
    }
  }, [lastEvent])

  return useMemo(() => {
    switch (data) {
      case 'simple':
        return notes.map(n => n.note)
      case 'extended':
        return notes
      default:
        throw new Error(`unknown data mode ${data}`)
    }
  }, [data, notes])
}

export const useSmartNotes = (config={}) => {
  const {data='simple'} = config
  const lastEvent = useLastEvent()
  const notes = useNotes({data: 'extended'})
  const [smartNotes, setSmartNotes] = useState({id: 0, events: []})

  useEffect(() => {
    if (!lastEvent) {
      return
    }
    setSmartNotes(smartNotes => {
      switch (lastEvent.messageType) {
        case 'noteon': 
        case 'noteoff': 
          const prevId = smartNotes.id
          const prevKeys = smartNotes.events.map(e => e.key)
          const nextKeys = notes.map(e => e.key)

          // handle alteration of current notes
          if (smartNotes.events.length) {
            if (nextKeys.length === 0) {
            // all notes removed
              return {
                events: [],
                id: prevId + 1,
              }
            }
            else if (isSubset(nextKeys, prevKeys)) {
              // notes were removed, but not all - not a new detection
              return smartNotes
            } else {
              return {
                events: [...notes],
                id: prevId, 
              }
            }
          }

          return {
            events: [...notes],
            id: prevId + 1,
          }
        default:
          return smartNotes
      }
    })
  }, [notes, lastEvent])

  return useMemo(() => {
    switch (data) {
      case 'simple':
        return smartNotes.map(n => n.note)
      case 'extended':
        return smartNotes
      default:
        throw new Error(`unknown data mode ${data}`)
    }
  }, [data, smartNotes])
}

// is a subset of b - O(n) using Set instead of O(n²)
const isSubset = (a, b) => {
  const setB = new Set(b)
  return a.every(val => setB.has(val))
}

