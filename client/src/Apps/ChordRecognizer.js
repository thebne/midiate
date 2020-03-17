import React from 'react'
import { connect } from 'react-redux'
import { getCurrentlyPlayed } from '../redux/selectors'
import { Midi } from "@tonaljs/tonal"
import { detect } from "@tonaljs/chord-detect"

class ChordRecognizer extends React.Component {
  render() {
    let notes = this.props.currentlyPlayed
    const current = notes.sort((n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
    const detection = detect(current).join(" OR ")
    const notesList = current.map((s) => <li key={s}>{s}</li>)

    return <div>
      <h1>{detection}</h1><ul>{notesList}</ul>
      </div>
  }

  // TODO move to config.json
}

export function config() {
  return {name: "Chord Recognizer"}
}

export default connect(
  (state) => ({ currentlyPlayed: getCurrentlyPlayed(state) })
)(ChordRecognizer)
