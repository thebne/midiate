import React, { useCallback } from 'react'
import Slider from '@material-ui/core/Slider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import Switch from '@material-ui/core/Switch'
import UsbIcon from '@material-ui/icons/Usb'
import RestorePageIcon from '@material-ui/icons/RestorePage'
import { useSetting } from '../../../api/settings'
import { useMidiOutputs } from '../../../api/midi'
import { 
  useShouldSendOutputEvent,
  useToggleSendOutputEvent 
} from '../../../api/events'

export default React.memo(function MidiOutput() {
  const midiOutputs = useMidiOutputs()
  const [activeOutputs, setActiveOutputs] = useActiveOutputs()
  const shouldSendOutputEvent = useShouldSendOutputEvent()
  const toggleSendOutputEvent = useToggleSendOutputEvent()

  const toggleMidiOutput = useCallback((output) => {
    setActiveOutputs(activeOutputs => {
      const newOutputs = [...activeOutputs]
      if (newOutputs.indexOf(output.id) !== -1) {
        newOutputs.splice(output.id, 1)
      } else {
        newOutputs.push(output.id)
      }
      return newOutputs
    })
  }, [setActiveOutputs])

	return (
    <React.Fragment>
      <List>
        <ListSubheader>MIDI Output</ListSubheader>
        <ListItem button
            onClick={() => toggleSendOutputEvent(!shouldSendOutputEvent)}
          >
          <ListItemIcon>
            <RestorePageIcon />
          </ListItemIcon>
          <ListItemText primary={'Play generated output in browser'} />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              onChange={() => toggleSendOutputEvent(!shouldSendOutputEvent)}
              checked={shouldSendOutputEvent}
            />
          </ListItemSecondaryAction>
        </ListItem>
        {midiOutputs.map(output => (
          <ListItem key={output.id} button
              onClick={() => toggleMidiOutput(output)}
            >
            <ListItemIcon>
              <UsbIcon />
            </ListItemIcon>
            <ListItemText primary={output.name} />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={() => toggleMidiOutput(output)}
                checked={activeOutputs.indexOf(output.id) !== -1}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      <TransposeControl />
      </List>
    </React.Fragment>
	)
})

const TransposeControl = React.memo(function () {
  const [transpose, setTranspose] = useTranspose()
  const onTransposeChange = useCallback(
    (e, v) => setTranspose(v),
    [setTranspose])

  return (
    <React.Fragment>
      <ListSubheader>Transpose MIDI Outputs</ListSubheader>
      <ListItem>
        Slide to transpose the output (in tones):
      </ListItem>
      <ListItem>
        <Slider
          value={transpose}
          step={0.5}
          marks={[{value: 0, label: '0'}]}
          min={-4}
          max={4}
          onChange={onTransposeChange}
          valueLabelDisplay="auto"
        />
      </ListItem>
    </React.Fragment>
  )
})

export const useTranspose = () => 
  useSetting('transpose', 0)
export const useActiveOutputs = () => 
  useSetting('activeOutputs', [])
