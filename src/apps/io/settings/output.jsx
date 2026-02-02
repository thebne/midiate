import React, { useCallback } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import Switch from '@material-ui/core/Switch'
import UsbIcon from '@material-ui/icons/Usb'
import { useSetting } from '../../../api/settings'
import { useMidiOutputs } from '../../../api/midi'

export default React.memo(function MidiOutput() {
  const midiOutputs = useMidiOutputs()
  const [activeOutputs, setActiveOutputs] = useActiveOutputs()

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
        {midiOutputs.length === 0 
          && <ListItem><i>no output devices found</i></ListItem>}
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
      </List>
    </React.Fragment>
	)
})

export const useActiveOutputs = () => 
  useSetting('activeOutputs', [])
