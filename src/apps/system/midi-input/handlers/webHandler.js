import React, { useMemo, useState, Fragment, useEffect } from 'react'
import { connect } from 'react-redux'
import { sendMidiEvent, setMidiDevices } from "../../../../redux/actions"
import { useMidiInput } from "../../../../api/midi"

// uses WebMIDI
function WebHandler({sendMidiEvent, setMidiDevices}) {
  const [inputs, setInputs] = useState([])

  useEffect(() => {	  
		navigator.requestMIDIAccess().then(function(access) {
      const refresh = e => {
        const inputs = Array.from(access.inputs.values())
        const outputs = Array.from(access.outputs.values())

        // update store with inputs
        setMidiDevices(inputs, outputs)
        
        // update inputs components
        setInputs(inputs)
      }

      access.onstatechange = refresh
      refresh()
    })
  }, [setMidiDevices, setInputs])

  return (
    <Fragment>
      {inputs.map(p => 
        <MidiInput key={p.id} name={p.name} sendMidiEvent={sendMidiEvent} />)}
    </Fragment>
  )
}

const MidiInput = React.memo(function ({name, sendMidiEvent}) {
  const port = useMidiInput(name)

  const onMidiMessage = useMemo(() => {
    let prevTime = null
    return message => {
      if (!port.active)
        return

      const deltaTime = prevTime === null ? 0 : message.timeStamp - prevTime 
  
      // TODO: move to forked @midimessage or to handleMessage
      if (message.data[0] === 254) {
        return
      }

      sendMidiEvent(deltaTime, message.data, port.id, port.name)
      prevTime = message.timeStamp
    }
  }, [port, sendMidiEvent])

  useEffect(() =>  {
    if (!port || port.state !== 'connected') { 
      return
    }

    // reconnect callback
    port.onmidimessage = onMidiMessage
  }, [port, onMidiMessage, sendMidiEvent])

  return null
})

export default connect(
  (state) => ({
  }),
  { sendMidiEvent, setMidiDevices }
)(WebHandler)
