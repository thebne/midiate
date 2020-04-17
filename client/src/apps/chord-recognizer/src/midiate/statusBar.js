import React from 'react'
import styles from '../style.module.css'

export default ({chords}) => {
  const detection = chords.detection.length ? chords.detection[0] : <i style={{color: '#ccc'}}>chord</i>
  return <span className={styles.statusBar}>{detection}</span>
}
