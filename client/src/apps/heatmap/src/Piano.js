import React, { useState, useEffect } from 'react'
import { Note, Scale, Midi } from "@tonaljs/tonal"

import styles from './Piano.module.css'

// if singleOctave is a note name, create only a single octave starting from this name
export default function Piano(props) {
  let notes
  let classes = {}  

  if (props.singleOctave) {
    // aggregate notes, ignore different octaves (use 1 as the octave)
    for (const n in props.classes) {
      classes[`${Note.pitchClass(n)}1`] = props.classes[n]
    }    
    notes = Scale.get(`${props.singleOctave}1 chromatic`).notes
  } else {
    classes = props.classes

    // range (tonaljs returns null if given an undefined)
    const startMidi = Midi.toMidi(props.startNote) || 0
    const endMidi = Midi.toMidi(props.endNote) || 127
    if (startMidi > endMidi)
      throw new Error(`start > end: ${props.startNote} > ${props.endNote}`)
    if (endMidi > 127 || startMidi < 0)
      throw new Error(`start or end out of bounds: ${props.startNote} < 0 ||  ${props.endNote} > 127`)

    notes = [...Array(endMidi - startMidi + 1).keys()].map(m => Note.fromMidi(startMidi + m))
  }   		  
	return <div className={styles.root}><div className={styles.pianoContainer}>
          <div className={'pianoBody'}><ul className={styles.notesList}>
            {notes.map(n => <PianoKey key={n} note={n} className={classes[n]} style={props.styles[n]} />
            )}
          </ul></div>
        </div></div>
}

function PianoKey(props) { 
    const type = Note.accidentals(Note.simplify(props.note)).length ? "black" : "white"
    return <li className={[styles.noteItem, styles[type], styles[props.className], props.note].join(' ')}>
        <div className={styles.noteBody}>
          <div className={'noteRender'} style={props.style}/>
        </div>
      </li>
}

