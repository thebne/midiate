import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { handleKeyboardEvent, setMidiInputs } from "../redux/actions"
import { isMidiInputActive } from "../redux/selectors"

// initalize keyboard mapping to notes - validKeys order will be by octave order
const validKeys = Array.from('q2w3er5t6y7uzsxdcvgbhnjm')
const midiBindingsPerKey = validKeys.map((x, index) => new Uint8Array([144, 60+index, 0]))
const keyboardTriggers = {}
validKeys.forEach((x,i) => keyboardTriggers[x] = midiBindingsPerKey[i])

function KeyboardHandler({handleKeyboardEvent}) { 
  useEffect(() => {	 	
	
	// handle key stroke
	const handleKeyStroke = ({key, type, shiftKey, timeStamp}) => {
		
		const lowerKey = key.toLowerCase()
		if (!keyboardTriggers[lowerKey]){ return }
		let prevTime = null
		const deltaTime = prevTime === null ? 0 : timeStamp - prevTime           	
		
		// on key down set velocity to 70, on shift + key down set velocity 127
		if (type === 'keydown') {
			const noteon = [...keyboardTriggers[lowerKey]]
			shiftKey ? noteon[2] = 127 : noteon[2] = 70
			handleKeyboardEvent(deltaTime, noteon)
		}
		else {
			handleKeyboardEvent(deltaTime, keyboardTriggers[lowerKey])
		}
		prevTime = timeStamp
	}	

	  // add event listeners
	  window.addEventListener('keydown', (e)=>{handleKeyStroke(e)});
	  window.addEventListener('keyup', (e)=>{handleKeyStroke(e)});			 
  }, [])

  return <Fragment />
}

export default connect(
  (state) => ({
    isMidiInputActive: isMidiInputActive(state),
  }),
  { handleKeyboardEvent, setMidiInputs }
)(KeyboardHandler)