import React from 'react'
import { connect } from 'react-redux'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import Switch from '@material-ui/core/Switch'
import UsbIcon from '@material-ui/icons/Usb'
import { 
  toggleMidiInput, 
} from '../../../redux/actions'
import { useMidiInputs } from '../../../api/midi'

const MidiInputs = (({toggleMidiInput}) => {
  const midiInputs = useMidiInputs()
  return (
    <List subheader={<ListSubheader>MIDI Inputs</ListSubheader>}>
      {midiInputs.length === 0 
        && <ListItem><i>no input devices found</i></ListItem>}
      {midiInputs.map(input => (
        <ListItem key={input.id} button
          onClick={e => toggleMidiInput(input.id, !input.active)}
        >
          <ListItemIcon>
            <UsbIcon />
          </ListItemIcon>
          <ListItemText primary={input.name} />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              onChange={e => toggleMidiInput(input.id, e.target.checked)}
              checked={input.active}
        />
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  )
})

export default connect(
  null,
  { toggleMidiInput }
)(MidiInputs)
