import React, { useState, useCallback } from 'react'
import { createSelector } from 'reselect'
import { useSelector, useDispatch } from 'react-redux'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import InboxIcon from '@material-ui/icons/MoveToInbox'
import MailIcon from '@material-ui/icons/Mail'
import MenuIcon from '@material-ui/icons/Menu'
import IconButton from '@material-ui/core/IconButton'
import AppDefaultIcon from '@material-ui/icons/MusicVideo'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

import { 
  getDrawerAppId,
  getApp,
  getApps,
  getDrawerOpen,
} from '../redux/selectors'
import { 
  switchDrawerApp, 
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
    margin: '.5em',
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
  }, [])

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
            ? React.createElement(apps[drawerAppId], {config: drawerAppConfig})
            : (
              <React.Fragment>
                <List>
                  {appConfigs.filter(app => app.openInDrawer === true).map(app => 
                    <AppItem key={app.id} {...app} />)}
                </List>
                <Divider />
                <List>
                  {items}
                </List>
              </React.Fragment>
          )}
          </div>
        </Drawer>
      </React.Fragment>
  )
}


function AppItem({ id, icon, name }) {
  const dispatch = useDispatch()
  return (
    <ListItem button onClick={() => dispatch(switchDrawerApp(id))}>
      <ListItemIcon>
        {icon ? React.createElement(icon) : <AppDefaultIcon />}
      </ListItemIcon>
      <ListItemText primary={name} />
    </ListItem>
  )
}

export default SideDrawer
