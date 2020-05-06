import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Midi, Chord, Progression } from "@tonaljs/tonal"
import { useSmartNotes } from './notes'


export function detect(notes, relative) {
  const current = notes.sort((n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
  // clean capital M for major chords
  return Chord.detect(current).map(c => c.replace("M", "")).sort(function(a, b){ return a.length - b.length; })
}

export const useChords = (filterFn=(x)=>x.note) => {
  const notes = useSmartNotes({data: 'extended'})
  const [detections, setDetections] = useState([])
  const [id, setId] = useState(null)

  // add or remove detections 
  useEffect(() => {
    setDetections(detections => {
      // filter with user-defined function
      const det = detect(filterFn(notes))
      if (det.length) {
        setId(id => {
          if (notes.id !== id) {
            return notes.id
          }
          return id
        })
        return det
      } else {
        setId(notes.id)
        return []
      }
    })
  }, [notes])
  return [detections, id]
}

export const useRelativeChords = (relativeScale, filterFn=(x)=>x.note) => {
  const [chords, id] = useChords(filterFn)
  const [roman, setRoman] = useState([])
  useEffect(() => {
    setRoman(roman => {
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
    })
  }, [chords])
  return [roman, id]
}
