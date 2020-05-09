import { useCallback } from 'react'
import { useRelativeChords } from '../../api/chords'
import { useSetting } from '../../api/settings'

export const arePropsEqual = (prevProps, nextProps) => {
  // compare to avoid re-rendering
  return (prevProps.chords.length === 0 && nextProps.chords.length === 0)
    || (
      prevProps.id === nextProps.id 
      && prevProps.chords.length === nextProps.chords.length
      && prevProps.chords.every(v => nextProps.chords.includes(v))
    )
}

export function useChords() {
    const [chordDetectionRange] = useSetting('chordDetectionRange', [null, null])
    const [relativeScale] = useSetting('relativeScale', false)

  const filter = useCallback((notes) => {
    const [start, end] = chordDetectionRange
    return notes.events.filter(e => {
      return (start === null || e.key >= start) && (end === null || e.key <= end)
    }).map(e => e.note)
  }, [chordDetectionRange])
  return useRelativeChords(relativeScale, filter)
}
