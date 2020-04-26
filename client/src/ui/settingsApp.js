import React, { Fragment, useState } from 'react'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Chip from '@material-ui/core/Chip'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'
import DoneIcon from '@material-ui/icons/Done'
import ErrorIcon from '@material-ui/icons/Error'
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications'
import { makeStyles } from '@material-ui/core/styles'
import { SETTINGS_APP_ID } from '../constants'
import { 
  toggleMidiInput, setMidiServerHost
} from '../redux/actions'
import { 
  getMidiInputs, 
  getMidiServerHost, 
  getMidiServerConnectionStatus
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


function ConnectToServerFormField({midiServerHost, midiServerConnectionStatus,
  setMidiServerHost}) { 
  const [showSelectServer, setShowSelectServer] = useState(false)
	const classes = useStyles()

  return (
    <Fragment>
      <FormControlLabel
        key={'_server'}    
        onChange={() => setShowSelectServer(true)}
        checked={midiServerHost.length !== 0}
        control={<Checkbox color="primary" />}
        label={!midiServerHost.length 
          ? <i>server...</i>
          : <Fragment>
              <i>{midiServerHost}</i>
              <Chip
                className={classes.infoChip}
                icon={midiServerConnectionStatus ? <DoneIcon /> : <ErrorIcon />}
                label={midiServerConnectionStatus ? "Connected" : "Not connected"}
                color={midiServerConnectionStatus ? "primary" : "secondary"}
              />
            </Fragment>}
        labelPlacement="end"
      />
      <ConnectToServerDialog 
        showSelectServer={showSelectServer}
        setShowSelectServer={setShowSelectServer}
        setMidiServerHost={setMidiServerHost} />
    </Fragment>
  )
}

function SettingsApp({midiInputs, toggleMidiInput, 
  midiServerHost, setMidiServerHost, midiServerConnectionStatus}) {
  return (
    <Container>
      <Typography variant="h4">
        Available MIDI inputs:
      </Typography>
      <FormControl component="fieldset">
        <FormGroup aria-label="position"> 
          {midiInputs.map(input => (
            <FormControlLabel
              key={input.name}    
              onChange={e => toggleMidiInput(input.name, e.target.checked)}
              checked={input.active}
              control={<Checkbox color="primary" />}
              label={input.name}
              labelPlacement="end"
            />
          ))}
          <ConnectToServerFormField
            midiServerConnectionStatus={midiServerConnectionStatus}
            midiServerHost={midiServerHost}
            setMidiServerHost={setMidiServerHost}
            />
        </FormGroup>
      </FormControl>
    </Container>
  )
}

export const config = {
  id: SETTINGS_APP_ID,
  name: 'Settings',
  icon: <SettingsApplicationsIcon />,
}

export default connect(
  state => ({
    midiInputs: getMidiInputs(state),
    midiServerHost: getMidiServerHost(state),
    midiServerConnectionStatus: getMidiServerConnectionStatus(state),
  }),
  { toggleMidiInput, setMidiServerHost }
)(SettingsApp)
