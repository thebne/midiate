import { Midi } from "@tonaljs/tonal"
import { detect as tonalDetect } from "@tonaljs/chord-detect"

export function detect(notes) {
  const current = notes.sort((n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
  // clean capital M for major chords
  return tonalDetect(current).map(c => c.replace("M", "")).sort(function(a, b){ return a.length - b.length; });
}