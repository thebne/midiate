import React, { Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { handleMidiEvent, setMidiDevices } from "../redux/actions"
import { isMidiInputActive } from "../redux/selectors"

// uses WebMIDI
function WebHandler({isMidiInputActive, handleMidiEvent, setMidiDevices}) {
  useEffect(() => {	  
		navigator.requestMIDIAccess().then(function(access) {
      const createOnMidiMessage = (inputName) => {
        let prevTime = null
        return message => {
          if (!isMidiInputActive(inputName))
            return

          const deltaTime = prevTime === null ? 0 : message.timeStamp - prevTime 
		  
			// TODO: move to forked @midimessage
			if (message.data[0] === 254) {
				return
			}
  
          handleMidiEvent(deltaTime, message.data)
          prevTime = message.timeStamp
        }
      }

      // update store with inputs
      setMidiDevices(
        Array.from(access.inputs.values()),
        Array.from(access.outputs.values()),
      )

      // for now, just connect all the MIDI inputs
      for (const input of access.inputs.values()) {
        input.onmidimessage = createOnMidiMessage(input.name)
      }

      access.onstatechange = e => {
        // update store with inputs
        setMidiDevices(
          Array.from(access.inputs.values()),
          Array.from(access.outputs.values()),
        )

        if (e.port.state !== 'connected') { 
          return
        }

        // reconnect callback
        e.port.onmidimessage = createOnMidiMessage(e.port.name)
      }
    })
  }, [
    // redux
    handleMidiEvent, isMidiInputActive, setMidiDevices])

  return <Fragment />
}

export default connect(
  (state) => ({
    isMidiInputActive: isMidiInputActive(state),
  }),
  { handleMidiEvent, setMidiDevices }
)(WebHandler)
