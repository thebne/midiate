import React, { useCallback } from 'react'
import { Midi, Chord } from "@tonaljs/tonal"
import { useRelativeChords } from '../../api/chords'
import { useSetting } from '../../api/settings'

export const arePropsEqual = (prevProps, nextProps) => {
  // compare to avoid re-rendering
  const prevNotes = prevProps.notes.events.map(e => e.key)
  const nextNotes = nextProps.notes.events.map(e => e.key)

  return prevProps.notes.id === nextProps.notes.id 
    && prevNotes.length === nextNotes.length
    && prevNotes.every(v => nextNotes.includes(v))
}

export function useChords() {
    const [chordDetectionRange, _] = useSetting('chordDetectionRange', [null, null])
    const [relativeScale, __] = useSetting('relativeScale', false)

  const filter = useCallback((notes) => {
    const [start, end] = chordDetectionRange
    return notes.events.filter(e => {
      return (start === null || e.key >= start) && (end === null || e.key <= end)
    }).map(e => e.note)
  }, [chordDetectionRange])
  return useRelativeChords(relativeScale, filter)
}
