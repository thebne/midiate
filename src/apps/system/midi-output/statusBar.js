import React from 'react'
import Tooltip from '@material-ui/core/Tooltip'
import SlowMotionVideoIcon from '@material-ui/icons/SlowMotionVideo'
import Badge from '@material-ui/core/Badge'
import { green, red } from '@material-ui/core/colors'
import { useMidiOutputs } from '../../../api/midi'
import { useTranspose, useActiveOutputs } from './settings'

export default function StatusBar () {
  const midiOutputs = useMidiOutputs()
  const [activeOutputs] = useActiveOutputs()
  const [transpose] = useTranspose()
  
  const activeDevices = midiOutputs.filter(p => activeOutputs.indexOf(p.id) !== -1).length
  let outputsRepr
  switch (activeDevices) {
    case 0:
      outputsRepr = 'No active output'
      break
    case 1:
      outputsRepr = `Streaming to ${midiOutputs.filter(p => p.id === activeOutputs[0])[0].name}`
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
}
