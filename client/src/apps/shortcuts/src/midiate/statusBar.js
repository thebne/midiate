import React, { useEffect, useState } from 'react'
import { Note } from "@tonaljs/tonal"
import { getIsActive, setIsActive } from '../active'
import { register, unregister, focusByNote, clickByNote } from '../mutator'
import styles from '../style.module.css'

// TODO move to settings
const MAGIC_NOTE = 'A1'
const MAGIC_NOTE_DELAY_MS = 2000

export default ({lastEvent}) => {
  const [readyToToggle, setReadyToToggle] = useState(false)
  const [magicNoteTimer, setMagicNoteTimer] = useState(null)

  // register on load
  useEffect(() => {
    register(document.getElementById('root'))
    return () => {
      unregister()
    }
  }, [])

  // send events to mutator
  useEffect(() => {
    if (!lastEvent || readyToToggle)
      return

    const note = Note.pitchClass(lastEvent.note)
    if (lastEvent.messageType === 'noteon') {
      focusByNote(note)
    }
    else if (lastEvent.messageType === 'noteoff') {
      clickByNote(note)
    }
  }, [lastEvent])

  // check magic note
  useEffect(() => {
    if (readyToToggle) {
      // timer set, check if lastEvent is the relevant one
      if (lastEvent && lastEvent.messageType === 'noteoff' && lastEvent.note === MAGIC_NOTE) {
        setIsActive(!getIsActive())
        setMagicNoteTimer(null)
        setReadyToToggle(false)
        return
      }
    }
    else if (magicNoteTimer !== null) {
      // tracking in progress but we got another event
      // if it happened before the timer triggered, clear it
      if (!lastEvent || lastEvent.messageType === 'noteoff' || lastEvent.note === MAGIC_NOTE) {
        clearTimeout(magicNoteTimer)
        setMagicNoteTimer(null)
        return
      }
    }
    else if (lastEvent && lastEvent.messageType === 'noteon' && lastEvent.note === MAGIC_NOTE) {
      // it's the relevant note but there's no timer, set one
      setMagicNoteTimer(setTimeout(() => setReadyToToggle(true), MAGIC_NOTE_DELAY_MS))
    }
  }, [lastEvent])

  return (
    <div className={[readyToToggle && styles.ready, 
                     getIsActive() && styles.active,
                     magicNoteTimer && styles.tracking,
                     styles.statusBarIcon
    ].filter(x => x).join(' ')}>{MAGIC_NOTE}</div>
  )
}
