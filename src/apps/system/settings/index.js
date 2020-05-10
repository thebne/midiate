import React from 'react'
import { connect } from 'react-redux'
import Container from '@material-ui/core/Container'
import Radio from '@material-ui/core/Radio'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications'
import { SETTINGS_APP_ID } from '../../../constants'
import themes from '../../../ui/themes'
import { wrapContext } from '../../../api/context'
import { 
  setThemeId, 
} from '../../../redux/actions'
import { 
  getThemeId,
} from '../../../redux/selectors'


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

export default function SettingsApp() {
  const systemApps = require('../').default

  return (
    <Container>
      <ThemeSelector />
      {systemApps.map(app => {
        if (!app.settings)
          return null
        
        const Wrapped = wrapContext(app.settings, app.config)
        return <Wrapped key={app.config.id} />
      })}
    </Container>
  )
}

export const config = {
  id: SETTINGS_APP_ID,
  name: 'Settings',
  icon: SettingsApplicationsIcon,
}

