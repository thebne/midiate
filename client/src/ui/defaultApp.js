import React, { Fragment, useState } from 'react'
import { connect } from 'react-redux'
import Chip from '@material-ui/core/Chip'
import Container from '@material-ui/core/Container'
import DoneIcon from '@material-ui/icons/Done'
import ErrorIcon from '@material-ui/icons/Error'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import Checkbox from '@material-ui/core/Checkbox'
import Grid from '@material-ui/core/Grid'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'

import useStyles from './styles'
import { 
  switchForegroundApp, toggleMidiInput, setMidiServerHost
} from '../redux/actions'
import { 
  getRunningApps, getMidiInputs, getMidiServerHost, 
  getMidiServerConnectionStatus
} from '../redux/selectors'

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


function DefaultApp({currentApps, switchForegroundApp, 
  midiInputs, toggleMidiInput, midiServerHost, setMidiServerHost,
  midiServerConnectionStatus}) {
    
  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid item xs={8}>
          <ButtonGroup color="secondary">
            {currentApps.map(app => (
            <Button key={app.appId} onClick={() => switchForegroundApp(app.appId)}>
              {app.config.name}
            </Button>
            ))}
          </ButtonGroup>
        </Grid>
        <Grid item xs={4}>
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
        </Grid>
      </Grid>
    </Container>
  )
}

export default connect(
  state => ({
    currentApps: getRunningApps(state),
    midiInputs: getMidiInputs(state),
    midiServerHost: getMidiServerHost(state),
    midiServerConnectionStatus: getMidiServerConnectionStatus(state),
  }),
  { switchForegroundApp, toggleMidiInput, setMidiServerHost }
)(DefaultApp)
