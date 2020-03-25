import React, { Fragment } from 'react'
import { Midi } from "@tonaljs/tonal"
import { detect } from "@tonaljs/chord-detect"


function detectChord(notes) {
  const current = notes.sort((n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
  return detect(current)
}

export default class ChordRecognizer extends React.Component {
  render() {
    const {currentlyPlayed} = this.props
    const detection = detectChord(currentlyPlayed).join(" OR ")

    const current = currentlyPlayed.sort((n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
    const notesList = current.map((s) => <li key={s}>{s}</li>)

    return <div>
      <h1>{detection}</h1><ul>{notesList}</ul>
      </div>
  }

  // TODO move to config.json
}

export function StatusBar({currentlyPlayed}) {
  const chord = detectChord(currentlyPlayed)
  const detection = chord.length ? chord[0] : <i style={{color: '#ccc'}}>chord</i>
  return <Fragment>{detection}</Fragment>
}

export function config() {
  return {name: "Chord Recognizer"}
}

export let createSelectors = (selectors, state) => ({ currentlyPlayed: selectors.getCurrentlyPlayed(state) })
