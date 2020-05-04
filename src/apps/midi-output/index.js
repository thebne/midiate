import React from 'react'
import { connect, Provider } from 'react-redux'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Slider from '@material-ui/core/Slider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Switch from '@material-ui/core/Switch'
import UsbIcon from '@material-ui/icons/Usb'
import { makeStyles } from '@material-ui/core/styles'
import store, 
  {selectOutput, deselectOutput, setTranspose} 
from './redux'

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
  },
  title: {
    fontFamily: "'Baloo Tamma 2', cursive",
  },
}))


const MidiOutput = connect(
  store => ({
    outputs: store.outputs,
    transpose: store.transpose,
  }),
  { selectOutput, deselectOutput, setTranspose }
)(function MidiOutput({outputs, selectOutput, deselectOutput,
  midiOutputs, transpose, setTranspose}) {
  const classes = useStyles()

  const toggleMidiOutput = (output) => {
    if (outputs.indexOf(output.id) !== -1) {
      deselectOutput(output.id)
    } else {
      selectOutput(output.id)
    }
  }

	return (
    <Container className={classes.root} maxWidth={null}>
      <Typography variant='h5'>MIDI outputs</Typography>
      <List>
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
                checked={outputs.indexOf(output.id) !== -1}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Typography variant='h5'>Transpose</Typography>
      <Slider
          value={transpose}
          step={0.5}
          marks
          min={-3}
          max={3}
          valueLabelDisplay="auto"
          onChange={(e, v) => setTranspose(v)}
        />
    </Container>
	)
})

export default function App(props) {
  return (
    <Provider store={store}>
        <MidiOutput {...props} />
    </Provider>
  )
}

// midiate support
export { default as config } from './midiate/config'
export { default as StatusBar } from './midiate/statusBar'
export { default as createSelectors } from './midiate/selectors'
