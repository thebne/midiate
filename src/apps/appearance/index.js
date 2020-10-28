import React from 'react'
import { connect } from 'react-redux'
import Radio from '@material-ui/core/Radio'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import BrushIcon from '@material-ui/icons/Brush'
import themes from '../../ui/themes'
import { 
  setThemeId, 
} from '../../redux/actions'
import { 
  getThemeId,
} from '../../redux/selectors'


export default connect(
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

export const config = {
  id: 'APPEARANCE',
  name: 'Appearance',
  description: "Color themes and animations",
  icon: BrushIcon,
  openInDrawer: true,
}

