import React, { Fragment, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { Note, Midi } from "@tonaljs/tonal"

import styles from './Style.module.css'


const NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Bb', 'C#', 'Eb', 'F#', 'G#']
const hashNote = n => Midi.toMidi(`${n}1`)
let ColorHash = require('color-hash')

let assignedNotes = {}

const assignNote = (element) => {
  for (const [noteMidi, [e,]] of Object.entries(assignedNotes)) {
    // check if it's still active and clean if needed
    if (!document.body.contains(e)) {
      delete assignedNotes[noteMidi]
    }
  }

  const notePos = Object.keys(assignedNotes).length
  if (notePos >= NOTES.length) {
    console.error('Too many links - not implemented')
    return
  }

  const note = NOTES[notePos]
  const vis = document.createElement('div')
  assignedNotes[hashNote(note)] = [element, vis]
  return [note, vis]
}
let isActive = false
export const getIsActive = () => isActive
export const setIsActive = (flag) => {
  Object.values(assignedNotes).forEach(([, visualization]) => {
    visualization.style.display = flag ? 'inherit' : 'none'
  })
  isActive = flag
}

export const focusByNote = (note) => {
  if (!getIsActive())
    return

  if (!assignedNotes[hashNote(note)]) 
    return

  const [e,] = assignedNotes[hashNote(note)]
  e.focus()
}

export const clickByNote = (note) => {
  if (!getIsActive())
    return

  if (!assignedNotes[hashNote(note)]) 
    return

  const [e,] = assignedNotes[hashNote(note)]
  e.click()
  e.blur()
}


const colorHash = new ColorHash({lightness: .7})

let observer
// usage: register the observer on the target node (for instance <body/>)
export const register = (targetNode) => {
	// Options for the observer (which mutations to observe)
	const config = { 
    attributeFilter: ['onclick', 'href'],
    childList: true, 
    subtree: true 
  }

	// Callback function to execute when mutations are observed
	const callback = function(mutationsList) {
    mutationsList.forEach(r => {
      if (r.target.onclick == null && r.target.href == null) {
        return
      }

      if (Array.from(r.target.childNodes).some(e => e.className === styles.keyShortcut))
        return


      // assign a note to element
      const [note, vis] = assignNote(r.target)
      if (!note)
        return
      
      // add a new contaienr for the key index
      const container = document.createElement('div')
      container.style.position = 'relative'

      // temporarily stop observing and change the DOM
      observer.disconnect(callback)
      r.target.insertBefore(container, r.target.firstChild)
      observer.observe(targetNode, config)

      // assign visualization
      vis.className = styles.keyShortcut
      vis.style.backgroundColor = colorHash.hex(note)
      vis.style.display = getIsActive() ? 'inherit' : 'none'
      vis.innerText = note
      container.appendChild(vis)
    })
  }

  // Create an observer instance linked to the callback function
  observer = new MutationObserver(callback)

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config)
}

export const unregister = () => observer.disconnect()


/** MIDIate-specific **/

// TODO move to settings
const MAGIC_NOTE = 'A1'
const MAGIC_NOTE_DELAY_MS = 3000

export default () => {
  return <div>Help for shortcuts go here</div>
}

export function StatusBar({lastEvent}) {
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
    if (!lastEvent)
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
      if (lastEvent && lastEvent.messageType == 'noteoff' && lastEvent.note == MAGIC_NOTE) {
        setIsActive(!getIsActive())
        setMagicNoteTimer(null)
        setReadyToToggle(false)
        return
      }
    }
    else if (magicNoteTimer !== null) {
      // tracking in progress but we got another event
      // if it happened before the timer triggered, clear it
      if (!lastEvent || lastEvent.messageType == 'noteoff' || lastEvent.note == MAGIC_NOTE) {
        clearTimeout(magicNoteTimer)
        setMagicNoteTimer(null)
        return
      }
    }
    else if (lastEvent && lastEvent.messageType == 'noteon' && lastEvent.note == MAGIC_NOTE) {
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

export function config() {
  return {name: "Shortcuts"}
}

export let createSelectors = (selectors, state) => ({ 
	lastEvent : selectors.getLastEvent(state),
})
