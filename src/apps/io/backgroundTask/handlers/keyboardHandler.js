import { useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import { sendKeyboardEvent } from "../../../../redux/actions"

const VELOCITY_MAX = 127
const VELOCITY_MID = 64

// initalize keyboard mapping to notes - validKeys order will be by octave order
const validKeys = Array.from('q2w3er5t6y7uzsxdcvgbhnjm')
const midiBindingsPerKey = validKeys.map((x, index) => new Uint8Array([144, 60+index, 0]))
const keyboardTriggers = {}
validKeys.forEach((x,i) => keyboardTriggers[x] = midiBindingsPerKey[i])
const currentMap = {}
let prevEventTime = null

function KeyboardHandler({sendKeyboardEvent}) { 
  const handleKeyStroke = useCallback(
    ({key, type, shiftKey, timeStamp}) => {
      const lowerKey = key.toLowerCase()
      if (!keyboardTriggers[lowerKey]) { 
        return true
      }

      // send one keydown for each key
      if (type === 'keydown' && currentMap[lowerKey]) {
        return true
      }
      currentMap[lowerKey] = type === 'keydown'

      const deltaTime = prevEventTime === null ? 0 : timeStamp - prevEventTime
      
      const msg = [...keyboardTriggers[lowerKey]]
      if (type === 'keydown') {
        // on key down set velocity to MAX, on shift + key down set velocity to MID
        msg[2] = shiftKey ? VELOCITY_MAX : VELOCITY_MID
      }
      sendKeyboardEvent(deltaTime, msg)

      prevEventTime = timeStamp
      return true
    }, [sendKeyboardEvent])	

  useEffect(() => {
    // add event listeners
	  window.addEventListener('keydown', handleKeyStroke)
	  window.addEventListener('keyup', handleKeyStroke) 
  }, [handleKeyStroke])

  return null 
}

export default connect(null,
  { sendKeyboardEvent }
)(KeyboardHandler)
