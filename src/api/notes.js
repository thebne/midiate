import { useState, useEffect, useRef } from 'react'
import { useLastEvent } from './events'

export const useNotes = (config={}) => {
  const {data='simple'} = config
  const lastEvent = useLastEvent()
  const [notes, setNotes] = useState([])

  useEffect(() => {
    if (!lastEvent) {
      return 
    }
    setNotes(notes => {
      const newNotes = [...notes]
      switch (lastEvent.messageType) {
        case 'noteon': 
          return newNotes.concat({...lastEvent})
        
        case 'noteoff': 
          return newNotes.filter(n => n.key !== lastEvent.key)
        default:
          return notes
      }
    })
  }, [lastEvent])

  switch (data) {
    case 'simple':
      return notes.map(n => n.note)
    case 'extended':
      return notes
    default:
      throw new Error(`unknown data mode ${data}`)
  }
}

export const useSmartNotes = (config={}) => {
  const {data='simple'} = config
  const lastEvent = useLastEvent()
  const notes = useNotes({data: 'extended'})
  const prevNotes = usePrevious(notes)
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
          const prevKeys = (prevNotes || []).map(e => e.key)
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
  }, [notes, prevNotes, lastEvent])

  switch (data) {
    case 'simple':
      return smartNotes.map(n => n.note)
    case 'extended':
      return smartNotes
    default:
      throw new Error(`unknown data mode ${data}`)
  }
}

// is a subset of b
const isSubset = (a, b) => a.every(val => b.includes(val))

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
