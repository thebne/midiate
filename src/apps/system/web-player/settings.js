import React from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { useSetting, useSessionValue } from '../../../api/settings'

import allInstrumentTypes from './instruments'

export default function Settings() {
	return (
    <React.Fragment>
      <List>
        <ListSubheader>Audio Web Player</ListSubheader>
        <ListItem>
          <ListItemIcon>
            <PlayCircleFilledIcon />
          </ListItemIcon>
          <ListItemText primary='Instrument type' />
            <InstrumentTypeField />
        </ListItem>
      </List>
    </React.Fragment>
	)
}

function InstrumentTypeField() {
  const [instrumentType, setInstrumentType] = useInstrumentType()

  return (
    <Autocomplete
      value={instrumentType}
      options={allInstrumentTypes}
      style={{width: '50%'}}
      renderInput={(params) => <TextField {...params} label="Instrument" variant="outlined" />}
      onChange={(e, v) => {
        if (!v || allInstrumentTypes.indexOf(v) !== -1)
          setInstrumentType(v)
      }}
    />
  )
}

export const useInstrumentType = () =>
  useSetting('instrumentType', 'acoustic_grand_piano')
export const useLoading = () =>
  useSessionValue('loading', true)
