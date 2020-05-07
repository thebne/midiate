import { useMemo } from 'react'
import { Midi, Chord, Progression } from "@tonaljs/tonal"
import { useSmartNotes } from './notes'


export function detect(notes, relative) {
  const current = notes.sort((n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
  // clean capital M for major chords
  return Chord.detect(current).map(c => c.replace("M", "")).sort(function(a, b){ return a.length - b.length; })
}

export const useChords = (filterFn=(x)=>x.note) => {
  const notes = useSmartNotes({data: 'extended'})
  const detection = useMemo(() => detect(filterFn(notes)),
    [notes, filterFn])

  return [detection, notes.id]
}

export const useRelativeChords = (relativeScale, filterFn=(x)=>x.note) => {
  const [chords, id] = useChords(filterFn)
  const roman = useMemo(() => {
    if (!relativeScale) {
      if (!chords.length) {
        return []
      }
      let [main, ...rest] = chords
      return [main, ...rest.filter(c => c.length <= main.length)] 
    }

    if (chords.length) {
      const numerals = Progression.toRomanNumerals(relativeScale, chords)
      return [numerals[0], chords[0]]
    }
    return []
  }, [chords, relativeScale])
  return [roman, id]
}
