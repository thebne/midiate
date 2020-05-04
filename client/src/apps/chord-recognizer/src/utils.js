import { Midi, Chord } from "@tonaljs/tonal"

export const arePropsEqual = (prevProps, nextProps) => {
  // compare to avoid re-rendering
  const prevNotes = prevProps.notes.events.map(e => e.key)
  const nextNotes = nextProps.notes.events.map(e => e.key)

  return prevProps.notes.id === nextProps.notes.id 
    && prevNotes.length === nextNotes.length
    && prevNotes.every(v => nextNotes.includes(v))
}

export function detect(notes, relative) {
  const current = notes.sort((n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
  // clean capital M for major chords
  return Chord.detect(current).map(c => c.replace("M", "")).sort(function(a, b){ return a.length - b.length; })
}
