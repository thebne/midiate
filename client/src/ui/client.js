import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import Snackbar from '@material-ui/core/Snackbar'
import Button from '@material-ui/core/Button'
import { CssBaseline } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { addApp, switchForegroundApp } from '../redux/actions'
import { 
  getForegroundAppId, 
  getIsAnyMidiInputActive,
  getAppConfig,
} from '../redux/selectors'

import ServerHandler from '../handlers/serverHandler'
import KeyboardHandler from '../handlers/keyboardHandler'
import WebHandler from '../handlers/webHandler'

import StatusBar from './statusBar'
import LoadingScreen from './loadingScreen'
import { SETTINGS_APP_ID } from '../constants'

// passing this reference to apps later on
import * as storeSelectors from '../redux/selectors'
import * as storeActions from '../redux/actions'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'fixed',
    width: '100%',
    height: '100%',
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
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
    }
  }

  componentDidMount() {
    let statusBar = {}, apps = {}

    // load system apps
    const systemApps = [
      require('./defaultApp'), 
      require('./settingsApp'), 
    ]
    systemApps.forEach(app => {
      if (!app.config || typeof app.config.id !== "string") {
        throw new Error(`system app does not define valid id`)
      }
      
      this.props.addApp(app.config.id, app.config)
      apps[app.config.id] = app.default
    })

    // load apps from config file 
    const appsFromConfig = require('../config/apps')

    appsFromConfig.default.forEach((app, i) => {
      if (app.config && typeof app.config.id === "string") {
        throw new Error(`apps should not define id ${app.config.name}`)
      }

      // add app to store - positive indices (0, 1, ...)
      const appId = i + 1

      this.props.addApp(appId, app.config)
      // assign selectors as props to app if requested
			const appSelectors = app.createSelectors ? 
        ((state, ownProps) => app.createSelectors(storeSelectors, state, ownProps)) : null
      // assign dispatchers as props to app if requested
			const appDispatchers = app.createDispatchers ? 
        ((dispatch, ownProps) => app.createDispatchers(storeActions, dispatch, ownProps)) : null
      // finally, connect app to requested apis using redux
			let connectFn = connect(appSelectors, appDispatchers)

      // save apps on state
      if (app.default)
        apps[appId] = connectFn(app.default)
      if (app.StatusBar)
        statusBar[appId] = connectFn(app.StatusBar)
    })

    this.setState({apps, statusBar})
  }

  render() {
    const {apps, statusBar} = this.state
    const {foregroundAppId, getAppConfig} = this.props

    let app
    if (apps[foregroundAppId]) {
      app = React.createElement(apps[foregroundAppId], {appId: foregroundAppId, config: getAppConfig(foregroundAppId)})
    }
    const bars = Object.entries(statusBar).map(([id, s]) => 
      React.createElement(s, {appId: id, config: getAppConfig(id)}))

    // render with all the other UI elements
		return (
      <Fragment> 
	    <KeyboardHandler />
        <WebHandler />		
        <ServerHandler />

        <CssBaseline />

        <LoadingScreen /> 
        <AppContainer {...this.props} statusBar={bars}>
          {app}
        </AppContainer>
      </Fragment>
    )
  }
}

function AppContainer(props) {
	const classes = useStyles()

	return <div className={
    [
      classes.root, 
      props.isAnyMidiInputActive ? "hasMidiInputs" : "noMidiInputs",
    ].join(' ')}>
        <StatusBar {...props} />
				<main className={classes.content}>
					<div className={classes.appBarSpacer} />
					<div className={classes.container}>
            {props.children}
					</div>
				</main>
          <Snackbar
            open={!props.isAnyMidiInputActive 
              && props.foregroundAppId !== SETTINGS_APP_ID}
            message="No active MIDI inputs"
          action={
            <Button color="inherit" 
              onClick={() => props.switchForegroundApp(SETTINGS_APP_ID)}>
              Choose
            </Button>
          }
        />
			</div>
}

export default connect(
  (state, ownProps) => ({
    foregroundAppId: getForegroundAppId(state),
    getAppConfig: id => getAppConfig(state, id),
    isAnyMidiInputActive: getIsAnyMidiInputActive(state),
  }),
  { 
    addApp, 
    switchForegroundApp,
  }
)(Client)
