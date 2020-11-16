import React, { useCallback } from 'react'
import { createSelector } from 'reselect'
import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import MenuIcon from '@material-ui/icons/Menu'
import IconButton from '@material-ui/core/IconButton'
import AppDefaultIcon from '@material-ui/icons/MusicVideo'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

import { 
  getDrawerAppId,
  getApps,
  getDrawerOpen,
} from '../redux/selectors'
import { 
  switchDrawerApp, 
  switchForegroundApp,
  toggleDrawer, 
} from '../redux/actions'

const useStyles = makeStyles({
  drawer: {
    width: '20vw',
  },
  btnContainer: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 100,
  },
})

const getDrawerAppConfig = createSelector(
  [getApps, getDrawerAppId],
  (apps, id) => apps[id]
)

function SideDrawer({ apps, items }) {
  const classes = useStyles()

  const drawerOpen = useSelector(getDrawerOpen)
  const drawerAppId = useSelector(getDrawerAppId)
  const drawerAppConfig = useSelector(getDrawerAppConfig)
  const appConfigs = Object.values(useSelector(getApps))
  const dispatch = useDispatch()

  const toggle = useCallback(open => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }

    dispatch(toggleDrawer(open))
  }, [dispatch])

  return (
      <React.Fragment>
        <IconButton 
          color="inherit" 
          onClick={toggle(true)} 
        >
          <MenuIcon />
        </IconButton> 
        <Drawer anchor='right' open={drawerOpen} onClose={toggle(false)}>
          <div
            className={classes.drawer}
            role="presentation"
            onKeyDown={toggle(false)}
          >
          {drawerAppId != null 
          && (
            <div className={classes.btnContainer}>
              <IconButton 
                onClick={() => dispatch(switchDrawerApp(null))}
                className={classes.backButton}
              >
                <ChevronLeftIcon />
              </IconButton>
            </div>
          )}
          {drawerAppId != null 
            ? (
              <React.Fragment>
                <AppItem {...drawerAppConfig} />
                {React.createElement(apps[drawerAppId], {config: drawerAppConfig})}
              </React.Fragment>
            )
            : (
              <React.Fragment>
                <List>
                  {appConfigs.filter(app => app.openInDrawer === true).map(app => 
                    <AppItem key={app.id} {...app} />)}
                </List>
                <Divider />
                <List>
                  {items.map(item => 
                    <ListItem key={item.props.config.id} button onClick={() => {
                      dispatch(switchForegroundApp(item.props.config.id))
                      dispatch(toggleDrawer(false))
                    }}>
                      {item}
                    </ListItem>
                  )}
                </List>
              </React.Fragment>
          )}
          </div>
        </Drawer>
      </React.Fragment>
  )
}


function AppItem({ id, icon, name, description }) {
  const dispatch = useDispatch()
  return (
    <ListItem button onClick={() => dispatch(switchDrawerApp(id))}>
      <ListItemIcon>
        {icon ? React.createElement(icon) : <AppDefaultIcon />}
      </ListItemIcon>
      <ListItemText primary={name} secondary={description} />
    </ListItem>
  )
}

export default SideDrawer
