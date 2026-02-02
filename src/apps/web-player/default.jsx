import React, { useCallback } from 'react'
import Slider from '@material-ui/core/Slider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { makeStyles } from '@material-ui/core/styles'
import { useInstrumentType, useTranspose } from './settings'

import allInstrumentTypes from './instruments'

const useStyles = makeStyles((theme) => ({
  input: {
    display: 'flex',
  },

  autocomplete: {
    flexGrow: 1,
  },
}))

export default function Settings() {
  const classes = useStyles()
	return (
    <React.Fragment>
      <List>
        <ListSubheader>Audio Web Player</ListSubheader>
        <ListItem>
          <ListItemIcon>
            <PlayCircleFilledIcon />
          </ListItemIcon>
          <ListItemText primary='Instrument type' className={classes.input} />
            <InstrumentTypeField />
        </ListItem>
        <TransposeControl />
      </List>
    </React.Fragment>
	)
}

function InstrumentTypeField() {
  const classes = useStyles()
  const [instrumentType, setInstrumentType] = useInstrumentType()

  return (
    <Autocomplete
      value={instrumentType}
      options={allInstrumentTypes}
      className={classes.autocomplete}
      renderInput={(params) => <TextField {...params} label="Instrument" variant="outlined" />}
      onChange={(e, v) => {
        if (!v || allInstrumentTypes.indexOf(v) !== -1)
          setInstrumentType(v)
      }}
    />
  )
}

const TransposeControl = React.memo(function () {
  const [transpose, setTranspose] = useTranspose()
  const onTransposeChange = useCallback(
    (e, v) => setTranspose(v),
    [setTranspose])

  return (
    <React.Fragment>
      <ListSubheader>Transpose Output</ListSubheader>
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
