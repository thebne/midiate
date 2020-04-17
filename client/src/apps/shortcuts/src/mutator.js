import assignedNotes, { assignNote, hashNote } from './assign'
import { getIsActive } from './active'
import styles from './style.module.css'

const ColorHash = require('color-hash')
const colorHash = new ColorHash({lightness: .7})


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

