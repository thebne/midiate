import React from 'react'
import { connect } from 'react-redux'
import Container from '@material-ui/core/Container'

import { addApp, switchForegroundApp } from '../redux/actions'
import { getForegroundAppId, getAppConfig } from '../redux/selectors'

import ServerHandler from '../handlers/serverHandler'

import DefaultApp from './DefaultApp'
import useStyles from './styles'
import StatusBar from './StatusBar'

// passing this reference to apps later on
import * as storeSelectors from '../redux/selectors'
import * as storeActions from '../redux/actions'


class Client extends React.Component {
  constructor(props) {
    super(props)
    // TODO change to window.location.host || envVar if exists (compile time)
    this.serverHandler = new ServerHandler(`${window.location.hostname}:5000`)
    this.defaultApp = <DefaultApp />

    this.state = {
      statusBar: [], 
      apps: [],
    }
  }

  componentDidMount() {
    // load apps from config file 
    const appsFromConfig = require('../config/apps')

    let statusBar = [], apps = []
    appsFromConfig.default.forEach((app, i) => {
      // add app to store
      this.props.addApp(i, app.config)
      // assign selectors as props to app if requested
			const appSelectors = app.createSelectors ? 
        ((state, ownProps) => app.createSelectors(storeSelectors, state, ownProps)) : null
      // assign dispatchers as props to app if requested
			const appDispatchers = app.createDispatchers ? 
        ((dispatch, ownProps) => app.createDispatchers(storeActions, dispatch, ownProps)) : null
      // finally, connect app to requested apis using redux
			let connectFn = connect(appSelectors, appDispatchers)

      // save apps on state
      apps.push(app.default 
        ? React.createElement(connectFn(app.default), {appId: i}) : null)
      statusBar.push(app.StatusBar ? 
        React.createElement(connectFn(app.StatusBar), {appId: i}) : null)
    })

    this.setState({apps, statusBar})
  }

  render() {
    // find active app, or render default one
		let app = this.state.apps[this.props.foregroundAppId] || this.defaultApp

    // render with all the other UI elements
		return <AppContainer {...this.props} statusBar={this.state.statusBar}>
             {app}
           </AppContainer>
  }
}

function AppContainer(props) {
	const classes = useStyles()

	return <div className={classes.root}>
        <StatusBar {...props} />
				<main className={classes.content}>
					<div className={classes.appBarSpacer} />
					<Container maxWidth="xl" className={classes.container}>
            {props.children}
					</Container>
				</main>
			</div>
}

export default connect(
  (state, ownProps) => ({
    foregroundAppId: getForegroundAppId(state),
    foregroundAppName: getAppConfig(state, getForegroundAppId(state)).name,
  }),
  { 
    addApp, 
    switchForegroundApp,
  }
)(Client)
