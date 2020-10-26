import React, { Fragment, useState } from 'react'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import Fade from '@material-ui/core/Fade'
import Chip from '@material-ui/core/Chip'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import DoneIcon from '@material-ui/icons/Done'
import ErrorIcon from '@material-ui/icons/Error'
import UsbIcon from '@material-ui/icons/Usb'
import PublicIcon from '@material-ui/icons/Public'
import { makeStyles } from '@material-ui/core/styles'
import { 
  toggleMidiInput, 
} from '../../../redux/actions'
import { useMidiInputs } from '../../../api/midi'

const useStyles = makeStyles(theme => ({
  dialogRoot: {
  },
  inputRow: {
    padding: theme.spacing(1),
    margin: theme.spacing(1.5),
  },
  infoChip: {
    marginLeft: theme.spacing(1.5),
  },
}))

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
