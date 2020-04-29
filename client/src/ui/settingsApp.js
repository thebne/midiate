import React, { Fragment, useState } from 'react'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Fade from '@material-ui/core/Fade'
import Chip from '@material-ui/core/Chip'
import Container from '@material-ui/core/Container'
import Radio from '@material-ui/core/Radio'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
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
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications'
import { makeStyles } from '@material-ui/core/styles'
import { SETTINGS_APP_ID } from '../constants'
import themes from './themes'
import { 
  toggleMidiInput, setMidiServerHost,
  setThemeId,
} from '../redux/actions'
import { 
  getMidiInputs, 
  getMidiServerHost, 
  getMidiServerConnectionStatus,
  getThemeId,
} from '../redux/selectors'

const useStyles = makeStyles(theme => ({
  infoChip: {
    marginLeft: theme.spacing(1.5),
  },
}))

function ConnectToServerDialog({showSelectServer, setShowSelectServer,
  setMidiServerHost}) {
  const [serverInputText, setServerInputText] = useState('')

  return (
      <Dialog open={showSelectServer} onClose={() => setShowSelectServer(false)}>
        <DialogTitle>Connect to remote MIDI server</DialogTitle>
        <TextField onChange={e => setServerInputText(e.target.value)}
          label='WebSocket URL' value={serverInputText} variant="filled" placeholder="e.g. 127.0.0.1:5000" />
        <Button onClick={() => {
          setMidiServerHost(serverInputText)
          setShowSelectServer(false)
        }} color="primary" size="large">Connect</Button>
        <ButtonGroup fullWidth={true} variant='text'>
          <Button size="small" onClick={() => setShowSelectServer(false)} color="secondary">Close</Button>
          <Button size="small" onClick={() => {
            setMidiServerHost('')
            setShowSelectServer(false)
          }} color="default">Clear</Button>
        </ButtonGroup>
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
      <Fade in={midiServerHost.length}>
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
        <ConnectToServerDialog 
          showSelectServer={showSelectServer}
          setShowSelectServer={setShowSelectServer}
          setMidiServerHost={setMidiServerHost} />
      </ListItem>
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
        <ListItem key={input.name}>
          <ListItemIcon>
            <UsbIcon />
          </ListItemIcon>
          <ListItemText primary={input.name} />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              onChange={e => toggleMidiInput(input.name, e.target.checked)}
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
        <ListItem button onClick={() => setThemeId(id)}>
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

function SettingsApp() {
  return (
    <Container>
      <MidiInputs />
      <ThemeSelector />
    </Container>
  )
}

export const config = {
  id: SETTINGS_APP_ID,
  name: 'Settings',
  icon: <SettingsApplicationsIcon />,
}

export default SettingsApp
