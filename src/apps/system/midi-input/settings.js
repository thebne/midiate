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
  toggleMidiInput, setMidiServerHost,
} from '../../../redux/actions'
import { 
  getMidiInputs, 
  getMidiServerHost, 
  getMidiServerConnectionStatus,
} from '../../../redux/selectors'

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

function ConnectToServerDialog({showSelectServer, setShowSelectServer,
  setMidiServerHost}) {
  const classes = useStyles()
  const [serverInputText, setServerInputText] = useState('')

  return (
      <Dialog open={showSelectServer} onClose={() => setShowSelectServer(false)}>
        <DialogTitle>Connect to remote MIDI server</DialogTitle>
        <DialogContent className={classes.dialogRoot}>
          <TextField onChange={e => setServerInputText(e.target.value)}
            fullWidth
            label='WebSocket URL' value={serverInputText} variant="filled" placeholder="e.g. 127.0.0.1:5000" />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => {
              setMidiServerHost('')
              setShowSelectServer(false)
            }}>Clear</Button>
            <Button onClick={() => setShowSelectServer(false)} >Close</Button>
            <Button onClick={() => {
              setMidiServerHost(serverInputText)
              setShowSelectServer(false)
            }} color="primary" variant='contained'
            >Connect</Button>
        </DialogActions>
      </Dialog>
  )
}


function ConnectToServerListItem({midiServerHost, midiServerConnectionStatus,
  setMidiServerHost}) { 
  const [showSelectServer, setShowSelectServer] = useState(false)
	const classes = useStyles()

  const serverText = (
    <Fragment>
      {!midiServerHost.length 
        ? <i>server...</i>
        : midiServerHost}
      <Fade in={!!midiServerHost.length}>
        <Chip
          className={classes.infoChip}
          icon={midiServerConnectionStatus ? <DoneIcon /> : <ErrorIcon />}
          label={midiServerConnectionStatus ? "Connected" : "Not connected"}
          color={midiServerConnectionStatus ? "primary" : "secondary"}
          />
      </Fade>
    </Fragment>
  )
  return (
    <Fragment>
      <ListItem>
        <ListItemIcon>
          <PublicIcon />
        </ListItemIcon>
        <ListItemText primary={serverText} />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            onChange={() => setShowSelectServer(true)}
            checked={midiServerHost.length !== 0}
            />
        </ListItemSecondaryAction>
      </ListItem>
      <ConnectToServerDialog 
        showSelectServer={showSelectServer}
        setShowSelectServer={setShowSelectServer}
        setMidiServerHost={setMidiServerHost} />
    </Fragment>
  )
}

const MidiInputs = (({midiInputs, toggleMidiInput, 
  midiServerHost, setMidiServerHost, midiServerConnectionStatus}) => {
  return (
    <List subheader={<ListSubheader>MIDI Inputs</ListSubheader>}>
      {midiInputs.map(input => (
        <ListItem key={input.id} button
          onChange={e => toggleMidiInput(input.id, !input.active)}
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
        <ConnectToServerListItem
          midiServerConnectionStatus={midiServerConnectionStatus}
          midiServerHost={midiServerHost}
          setMidiServerHost={setMidiServerHost}
          />
    </List>
  )
})

export default connect(
  state => ({
    midiInputs: getMidiInputs(state),
    midiServerHost: getMidiServerHost(state),
    midiServerConnectionStatus: getMidiServerConnectionStatus(state),
  }),
  { toggleMidiInput, setMidiServerHost }
)(MidiInputs)
