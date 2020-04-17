import React, { useState, useEffect } from 'react'
import { Note, Scale, Midi } from "@tonaljs/tonal"

import styles from './styles.module.css'

// TODO props...
const ANIMATION_DURATION_S = 8

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
          <div className={styles.pianoBody}><ul className={styles.notesList}>
            {notes.map(n => 
              <PianoKey key={n} note={n} className={classes[n]} />
            )}
          </ul></div>
        </div></div>
}

function PianoKey(props) { 
    const type = Note.accidentals(Note.simplify(props.note)).length ? "black" : "white"
    const [animations, setAnimations] = useState([])

    useEffect(() => {
      let newAnimations = [...animations]
      const now = new Date().getTime()
      switch (props.className) {
        case 'active':
          // the class is added, start a new animation (if there isn't one any)
          if (newAnimations.filter(a => a.active).length === 0)
            newAnimations.push({active: true, startTime: now })
          break
        default:
          // the class is removed, stop current animation
          newAnimations = (newAnimations
            .map(a => ({ ...a, active: false, endTime: a.active ? now : a.endTime }))
          )
          break
      }

      // remove animations that are too old
      newAnimations = newAnimations.filter(a => a.active || now - a.endTime <= ANIMATION_DURATION_S * 1000)

      // update all
      setAnimations(newAnimations)
    }, [props.className])

    return <li className={[styles.noteItem, styles[type], styles[props.className], props.note].join(' ')}>
        <div className={styles.noteBody}>
          <div className={styles.noteRender} />
          {animations.map(a => 
            <NoteAnimation key={a.startTime} {...a} />
          )}
        </div>
      </li>
}

function NoteAnimation({active, startTime, endTime}) {
  const timePassedSec = !active ? (endTime - startTime) / 1000 : null
  const style = {
    animationDuration: `${ANIMATION_DURATION_S}s`,
    maxHeight: active ? "inherit" : timePassedSec * ANIMATION_DURATION_S * 2 + "vh",
  }
	return <div className={styles.animationContainer}>
          <div className={styles.animationRender} style={style} />
    	</div>
}
