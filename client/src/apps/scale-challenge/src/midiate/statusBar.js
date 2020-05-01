import React, { Fragment } from 'react'
import { Note } from '@tonaljs/tonal'

import styles from '../style.module.css'

export default ({lastEvent}) => {
  let name, scale, class_ 
  if (lastEvent && lastEvent.note) {
    name = Note.pitchClass(lastEvent.note)
    scale = Note.octave(lastEvent.note)
    class_ = styles[lastEvent.messageType]
  }
  return <Fragment>
          {name
            ? <div className={[class_, styles.note].join(' ')}>
                <span className={styles.noteName}>{name}</span> 
                <span className={styles.noteScale}>{scale}</span> 
              </div>
            : <i style={{color: '#ccc'}}>note</i>}
    </Fragment>
}
