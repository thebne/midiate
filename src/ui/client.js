import React from 'react'
import { connect } from 'react-redux'
import Snackbar from '@material-ui/core/Snackbar'
import Button from '@material-ui/core/Button'
import { CssBaseline } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles'

import { addApp, switchForegroundApp } from '../redux/actions'
import { 
  getForegroundAppId, 
  getIsAnyMidiInputActive,
  getApp,
  getThemeId,
} from '../redux/selectors'

import { wrapContext } from '../api/context'
import StatusBar from './statusBar'
import LoadingScreen from './loadingScreen'
import themes from './themes'
import { SETTINGS_APP_ID } from '../constants'

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

  '@global': {
    '.hasMidiInputs': {
    },
    '.noMidiInputs': {
      '& .app-bar': {
        background: '#666' 
      }
    },
  }
}))

class Client extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      statusBar: {}, 
      apps: {},
      backgroundTasks: {},
    }
  }

  componentDidMount() {
    let statusBar = {}, apps = {}, backgroundTasks = {}

    const allAppsToLoad = []
    // load system apps from config file 
    const systemAppsFromConfig = require('../apps/system')
    systemAppsFromConfig.default.forEach(app => {
      if (!app.config || typeof app.config.id !== "string") {
        throw new Error(`system app does not define valid id`)
      }

      allAppsToLoad.push([app, app.config])
    })

    // load apps from config file 
    const appsFromConfig = require('../config/apps')

    appsFromConfig.default.forEach((app, i) => {
      if (app.config && typeof app.config.id === "string") {
        throw new Error(`apps should not define id ${app.config.name}`)
      }

      // add app to store - positive indices (0, 1, ...)
      const appConfig = {
        ...app.config,
        id: i + 1,
      }
      allAppsToLoad.push([app, appConfig])



    })
    for (const [app, appConfig] of allAppsToLoad) {
      const appId = appConfig.id
      this.props.addApp(appId, appConfig)
      // save apps on state
      if (app.default)
        apps[appId] = wrapContext(app.default, appConfig)
      if (app.StatusBar)
        statusBar[appId] = wrapContext(app.StatusBar, appConfig)
      if (app.BackgroundTask)
        backgroundTasks[appId] = wrapContext(app.BackgroundTask, appConfig)
    }

    this.setState({apps, statusBar, backgroundTasks})
  }

  render() {
    const {apps, statusBar, backgroundTasks} = this.state
    const {foregroundAppId, getApp} = this.props

    let app
    if (apps[foregroundAppId]) {
      app = React.createElement(apps[foregroundAppId], {config: getApp(foregroundAppId)})
    }
    const bars = Object.entries(statusBar).map(([id, s]) => 
      React.createElement(s, {config: getApp(id)}))

    const tasks = Object.entries(backgroundTasks).map(([id, s]) => 
      React.createElement(s, {config: getApp(id), key: id}))

    // render with all the other UI elements
		return (
      <Content {...this.props} statusBar={bars}>
        {tasks}
        {app}
      </Content>
    )
  }
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
  const {isAnyMidiInputActive, foregroundAppId,
    switchForegroundApp, children} = props

	return <div className={
    [
      classes.root, 
      isAnyMidiInputActive ? "hasMidiInputs" : "noMidiInputs",
    ].join(' ')}>
        <StatusBar {...props} />
				<main className={classes.content}>
					<div className={classes.appBarSpacer} />
					<div className={classes.container}>
            {children}
					</div>
				</main>
          <Snackbar
            open={!isAnyMidiInputActive 
              && foregroundAppId !== SETTINGS_APP_ID}
            message="No active MIDI inputs"
          action={
            <Button color="inherit" 
              onClick={() => switchForegroundApp(SETTINGS_APP_ID)}>
              Choose
            </Button>
          }
        />
			</div>
}

export default connect(
  (state, ownProps) => ({
    foregroundAppId: getForegroundAppId(state),
    getApp: id => getApp(state, id),
    isAnyMidiInputActive: getIsAnyMidiInputActive(state),
    theme: themes[getThemeId(state)].theme,
  }),
  { 
    addApp, 
    switchForegroundApp,
  }
)(Client)
