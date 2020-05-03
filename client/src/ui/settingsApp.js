import React, { Fragment, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Midi } from '@tonaljs/tonal'
import Button from '@material-ui/core/Button'
import Fade from '@material-ui/core/Fade'
import Chip from '@material-ui/core/Chip'
import Container from '@material-ui/core/Container'
import Radio from '@material-ui/core/Radio'
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
import EditIcon from '@material-ui/icons/Edit'
import PublicIcon from '@material-ui/icons/Public'
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications'
import { makeStyles } from '@material-ui/core/styles'
import { SETTINGS_APP_ID } from '../constants'
import themes from './themes'
import { 
  toggleMidiInput, setMidiServerHost,
  setThemeId, setChordDetectionRange
} from '../redux/actions'
import { 
  getMidiInputs, 
  getMidiServerHost, 
  getMidiServerConnectionStatus,
  getThemeId,
  getChordDetectionRange,
} from '../redux/selectors'

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

const MidiInputs = connect(
  state => ({
    midiInputs: getMidiInputs(state),
    midiServerHost: getMidiServerHost(state),
    midiServerConnectionStatus: getMidiServerConnectionStatus(state),
  }),
  { toggleMidiInput, setMidiServerHost }
)(({midiInputs, toggleMidiInput, 
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

const ThemeSelector = connect(
  state => ({
    themeId: getThemeId(state),
  }),
  { setThemeId }
)(({themeId, setThemeId}) => {
  return (
    <List subheader={<ListSubheader>Theme</ListSubheader>}>
      {themes.map(({name, description}, id) => (
        <ListItem button onClick={() => setThemeId(id)} key={id}>
          <ListItemIcon>
            <Radio
              edge="start"
              checked={id === themeId}
              />
          </ListItemIcon>
          <ListItemText primary={name} secondary={description} />
        </ListItem>
      ))}
    </List>
  )
})

const DetectionSettings = connect(
  state => ({
    chordDetectionRange: getChordDetectionRange(state),
  }),
  { setChordDetectionRange }
)(({chordDetectionRange, setChordDetectionRange}) => {
  const [showRangeDialog, setShowRangeDialog] = useState(false)
  const [start, end] = chordDetectionRange

  let rangeString
  if (typeof start === 'number' && typeof end === 'number') {
    rangeString = `${Midi.midiToNoteName(start)} to ${Midi.midiToNoteName(end)}`
  } else if (typeof start === 'number') {
    rangeString = `starting at ${Midi.midiToNoteName(start)}`
  } else if (typeof end === 'number') {
    rangeString = `ending at ${Midi.midiToNoteName(end)}`
  } else {
    rangeString = `not defined`
  }

  return (
    <Fragment>
      <List subheader={<ListSubheader>Chord Detection</ListSubheader>}>
        <ListItem button onClick={() => setShowRangeDialog(true)}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary='Chord detection note range'
            secondary={rangeString} />
        </ListItem>
      </List>
      <ChordDetectionRangeDialog
        showRangeDialog={showRangeDialog}
        setShowRangeDialog={setShowRangeDialog}
        setChordDetectionRange={setChordDetectionRange}
        initialValue={chordDetectionRange}
      />
    </Fragment>
  )
})

function ChordDetectionRangeDialog({showRangeDialog, setShowRangeDialog,
  setChordDetectionRange, initialValue}) {
  const classes = useStyles()
  const [initialStart, initialEnd] = initialValue
  const [start, setStart] = useState(initialStart ? Midi.midiToNoteName(initialStart) : '')
  const [end, setEnd] = useState(initialEnd ? Midi.midiToNoteName(initialEnd) : '')

  useEffect(() => {
    let newStart, newEnd
    if (start.length) {
      newStart = Midi.toMidi(start)
      if (newStart === null) 
        return
    } else {
      newStart = null
    }
    if (end.length) {
      newEnd = Midi.toMidi(end)
      if (newEnd === null) 
        return
    } else {
      newEnd = null
    }
    setChordDetectionRange(newStart, newEnd)
  }, [start, end,
    // redux
    setChordDetectionRange])

  return (
      <Dialog open={showRangeDialog} 
        onClose={() => setShowRangeDialog(false)}
      >
        <DialogTitle>Note range for chord detection</DialogTitle>
        <DialogContent className={classes.dialogRoot}>
          <TextField
                className={classes.inputRow}
                label="start note"
                placeholder='e.g. A1, blank for none'
                value={start || ''}
                onChange={e => setStart(e.target.value)}
                error={!!(start.length && Midi.toMidi(start) === null)}
                helperText={start.length && Midi.toMidi(start) === null ? "Invalid note name" : ' '}
              />
          <TextField
                className={classes.inputRow}
                label="end note"
                placeholder='e.g. B3, blank for none'
                value={end || ''}
                onChange={e => setEnd(e.target.value)}
                error={!!(end.length && Midi.toMidi(end) === null)}
                helperText={end.length && Midi.toMidi(end) === null ? "Invalid note name" : ' '}
              />
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => {setStart(''); setEnd('')}}>Reset</Button>
          <Button size="small" onClick={() => setShowRangeDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
  )
}

function SettingsApp() {
  return (
    <Container>
      <MidiInputs />
      <ThemeSelector />
      <DetectionSettings />
    </Container>
  )
}

export const config = {
  id: SETTINGS_APP_ID,
  name: 'Settings',
  icon: <SettingsApplicationsIcon />,
}

export default SettingsApp
