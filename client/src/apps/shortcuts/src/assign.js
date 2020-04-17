import { Midi } from "@tonaljs/tonal"

const NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Bb', 'C#', 'Eb', 'F#', 'G#']

let assignedNotes = {}

export const hashNote = n => Midi.toMidi(`${n}1`)
export const assignNote = (element) => {
  for (const [noteMidi, [e,]] of Object.entries(assignedNotes)) {
    // check if it's still active and clean if needed
    if (!document.body.contains(e)) {
      delete assignedNotes[noteMidi]
    }
  }

  const notePos = Object.keys(assignedNotes).length
  if (notePos >= NOTES.length) {
    console.error('Too many links - not implemented')
    return [null, null]
  }

  const note = NOTES[notePos]
  const vis = document.createElement('div')
  assignedNotes[hashNote(note)] = [element, vis]
  return [note, vis]
}

export default assignedNotes
