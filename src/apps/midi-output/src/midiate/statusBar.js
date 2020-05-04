import React, { useEffect } from 'react'
import Tooltip from '@material-ui/core/Tooltip'
import SlowMotionVideoIcon from '@material-ui/icons/SlowMotionVideo'
import Badge from '@material-ui/core/Badge'
import { green, red } from '@material-ui/core/colors'
import { connect, Provider } from 'react-redux'
import store from '../redux'

const StatusBar = connect(
  store => ({
    outputs: store.outputs,
    transpose: store.transpose,
  })
)(function StatusBar ({lastEvent, midiOutputs, outputs, transpose}) {
  // send output to devices
  useEffect(() => {
    if (!lastEvent || !outputs) {
      return
    }

    const data = [...lastEvent._data]
    data[1] = Math.max(0, Math.min(127, data[1] + transpose * 2))
    midiOutputs
      .filter(p => outputs.indexOf(p.id) !== -1)
      .filter(p => lastEvent.source.type !== 'midi' 
        // compare by name because ID isn't the same for inputs and outputs
        || lastEvent.source.name !== p.name)
      .forEach(o => o.send(data))
  }, [lastEvent, outputs])
  
  const activeDevices = midiOutputs.filter(p => outputs.indexOf(p.id) !== -1).length
  let outputsRepr
  switch (activeDevices) {
    case 0:
      outputsRepr = 'No active output'
      break
    case 1:
      outputsRepr = `Streaming to ${midiOutputs.filter(p => p.id === outputs[0])[0].name}`
      break
    default:
      outputsRepr = `Streaming to ${activeDevices} outputs`
  }
  
  return (
    <React.Fragment>
      <Tooltip title={outputsRepr} arrow enterDelay={0}>
        <Badge 
          badgeContent={transpose > 0 ? `+${transpose}` : transpose} 
          color="secondary" 
          invisible={transpose === 0}
        >
          <SlowMotionVideoIcon 
            style={{ color: activeDevices ? green[400] : red[400] }} />
        </Badge>
      </Tooltip>
    </React.Fragment>
  )
})

export default function (props) {
  return (
    <Provider store={store}>
        <StatusBar {...props} />
    </Provider>
  )
}
