import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import clsx from 'clsx'
import Snackbar from '@material-ui/core/Snackbar'
import Button from '@material-ui/core/Button'
import { CssBaseline } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles'

import { addApp, switchDrawerApp } from '../redux/actions'
import {
  getForegroundAppId,
  getDrawerAppId,
  getIsAnyMidiInputActive,
  getApp,
  getThemeId,
} from '../redux/selectors'

import { wrapContext } from '../api/context'
import StatusBar from './statusBar'
import LoadingScreen from './loadingScreen'
import themes from './themes'
import { IO_APP_ID } from '../constants'
import appsFromConfig from '../config/apps'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.background.default,
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    contain: 'strict',
  },
  container: {
    flexGrow: 1,
    position: 'relative',
    '@global > .MuiContainer-root': {
      padding: theme.spacing(4),
    }
  },
}))

function Client() {
  const dispatch = useDispatch()
  const foregroundAppId = useSelector(getForegroundAppId)
  const drawerAppId = useSelector(getDrawerAppId)
  const isAnyMidiInputActive = useSelector(getIsAnyMidiInputActive)
  const themeId = useSelector(getThemeId)
  const theme = themes[themeId].theme

  // Get app config helper
  const getAppConfig = useCallback((state, id) => getApp(state, id), [])
  const appConfigs = useSelector(state => {
    const configs = {}
    appsFromConfig.forEach(app => {
      if (app.config?.id) {
        configs[app.config.id] = getApp(state, app.config.id)
      }
    })
    return configs
  })

  // Initialize apps once on mount - memoized to prevent recreation
  const { apps, statusBar, drawer, backgroundTasks } = useMemo(() => {
    const apps = {}
    const statusBar = {}
    const drawer = {}
    const backgroundTasks = {}

    for (const app of appsFromConfig) {
      const appConfig = app.config
      if (!appConfig) {
        throw new Error('all apps must provide config')
      }

      const appId = appConfig.id
      if (appId === undefined) {
        console.error('no ID', appConfig)
        throw new Error('all apps must define ID')
      }

      if (app.default)
        apps[appId] = wrapContext(app.default, appConfig)
      if (app.StatusBar)
        statusBar[appId] = wrapContext(app.StatusBar, appConfig)
      if (app.BackgroundTask)
        backgroundTasks[appId] = wrapContext(app.BackgroundTask, appConfig)
      if (app.Drawer)
        drawer[appId] = wrapContext(app.Drawer, appConfig)
    }

    return { apps, statusBar, drawer, backgroundTasks }
  }, [])

  // Register apps in Redux on mount
  useEffect(() => {
    for (const app of appsFromConfig) {
      if (app.config?.id) {
        dispatch(addApp(app.config.id, app.config))
      }
    }
  }, [dispatch])

  // Memoize rendered elements
  const app = useMemo(() => {
    if (apps[foregroundAppId]) {
      return React.createElement(apps[foregroundAppId], {
        config: appConfigs[foregroundAppId]
      })
    }
    return null
  }, [apps, foregroundAppId, appConfigs])

  const statusBarItems = useMemo(() =>
    Object.entries(statusBar).map(([id, s]) =>
      React.createElement(s, { config: appConfigs[id], key: id }))
  , [statusBar, appConfigs])

  const drawerItems = useMemo(() =>
    Object.entries(drawer).map(([id, s]) =>
      React.createElement(s, { config: appConfigs[id], key: id }))
  , [drawer, appConfigs])

  const tasks = useMemo(() =>
    Object.entries(backgroundTasks).map(([id, s]) =>
      React.createElement(s, { config: appConfigs[id], key: id }))
  , [backgroundTasks, appConfigs])

  return (
    <Content
      theme={theme}
      foregroundAppId={foregroundAppId}
      drawerAppId={drawerAppId}
      isAnyMidiInputActive={isAnyMidiInputActive}
      switchDrawerApp={(id) => dispatch(switchDrawerApp(id))}
      statusBarItems={statusBarItems}
      drawerItems={drawerItems}
      apps={apps}
    >
      {tasks}
      {app}
    </Content>
  )
}

// separate to functional component to easily include themes
function Content(props) {
  return (
    <ThemeProvider theme={props.theme}> 
      {/* css */}
      <CssBaseline />
      {/* content */}
      <LoadingScreen /> 
      <AppLayout {...props}>
        {props.children}
      </AppLayout>
    </ThemeProvider>
  )
}

function AppLayout(props) {
	const classes = useStyles()
  const [hideWarning, setHideWarning] = useState(false)
  const {isAnyMidiInputActive, drawerAppId,
    switchDrawerApp, children} = props

  const switchToDefaultApp = useCallback(() =>
    switchDrawerApp(IO_APP_ID)
  , [switchDrawerApp])
  const dismissWarning = useCallback(() =>
    setHideWarning(true)
  , [])

	return (
    <div className={clsx(
      classes.root, 
      isAnyMidiInputActive ? "hasMidiInputs" : "noMidiInputs",
    )}>
      <StatusBar {...props} />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <div className={classes.container}>
          {children}
        </div>
      </main>
        <Snackbar
          open={!isAnyMidiInputActive 
            && drawerAppId !== IO_APP_ID
            && !hideWarning}
          message="No active MIDI inputs"
          action={
            <React.Fragment>
              <Button color="inherit" 
                onClick={switchToDefaultApp}>
                Choose
              </Button>
              <Button color="inherit" 
                onClick={dismissWarning}>
                Dismiss 
              </Button>
            </React.Fragment>
        }
      />
    </div>
  )
}

export default Client
