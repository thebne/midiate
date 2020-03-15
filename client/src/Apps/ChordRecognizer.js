import BaseApp from './BaseApp'

import React from 'react'
import { Midi } from "@tonaljs/tonal"
import { detect } from "@tonaljs/chord-detect"

class ChordRecognizer extends BaseApp {
  render() {
    const current = Array.from(this.state.current).sort((n1, n2) => Midi.toMidi(n1) - Midi.toMidi(n2))
    const detection = detect(current).join(" OR ")
    const notesList = current.map((s) => <li>{s}</li>)

    return <div><h1>{detection}</h1><ul>{notesList}</ul></div>
  }
}


export default ChordRecognizer
