import React from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { makeStyles } from '@material-ui/core/styles'
import { useInstrumentType } from './settings'

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

