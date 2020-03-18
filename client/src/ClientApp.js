import React from 'react'
import { connect } from 'react-redux'
import { addApp, switchForegroundApp } from './redux/actions'
import { getForegroundAppId, getAppConfig } from './redux/selectors'

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'

import { PROGRAM_NAME } from './constants'
import Default from './Apps/Default'
import ServerHandler from './ServerHandler'

// apps
import * as ChordRecognizer from './Apps/ChordRecognizer'
import * as LastNote from './Apps/LastNote'
import * as storeSelectors from './redux/selectors'
import * as storeActions from './redux/actions'

class ClientApp extends React.Component {
  constructor(props) {
    super(props)
    // TODO change to window.location.host || envVar if exists (compile time)
    this.serverHandler = new ServerHandler('127.0.0.1:5000')

    this.appCache = []
    this.defaultApp = <Default />
  }

  componentDidMount() {
    // load apps
    [ 
      ChordRecognizer,
      LastNote
    ].forEach((app, i) => {
      this.props.addApp(i, app.config())

			const appSelectors = app.createSelectors ? ((state, ownProps) => app.createSelectors(storeSelectors, state, ownProps)) : null
			const appDispatchers = app.createDispatchers? ((dispatch, ownProps) => app.createDispatchers(storeActions, dispatch, ownProps)) : null
			let connectFn = connect(appSelectors, appDispatchers)

      this.appCache.push(React.createElement(connectFn(app.default), {appId: i}))
    })
  }

  render() {
		let app = this.appCache[this.props.foregroundAppId] || this.defaultApp

		return <AppContainer {...this.props} app={app} />
  }
}

function AppContainer(props) {
	const classes = useStyles()

  let handleBackToDefaultApp = () => {
    props.switchForegroundApp(null)
  }

		let button
    if (props.foregroundAppId != null) {
			button = <Button onClick={handleBackToDefaultApp} color="inherit"
									className={classes.backButton}>Back</Button>
		}

	return <div className={classes.root}>
				<AppBar position="absolute" className={classes.appBar}>
					<Toolbar className={classes.toolbar}>
						<div className={classes.title}>
							<Typography component="h1" variant="h5" color="inherit" noWrap className={classes.titleText}>
								♫{PROGRAM_NAME}♫
							</Typography>
							<Typography variant="subtitle1" color="inherit" noWrap className={classes.titleSecondaryText}>
								{props.foregroundAppName}
							</Typography>
						</div>
						{button}
					</Toolbar>
				</AppBar>
				<main className={classes.content}>
					<div className={classes.appBarSpacer} />
					<Container maxWidth="lg" className={classes.container}>
					{props.app}
					</Container>
				</main>
			</div>
}


const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  title: {
    flexGrow: 1,
  },

	titleText: {
		display: 'inline-block',	
	},

	titleSecondaryText: {
		display: 'inline-block',	
		paddingLeft: theme.spacing(4),
	},

  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
}))


export default connect(
  (state, ownProps) => ({
    foregroundAppId: getForegroundAppId(state),
    foregroundAppName: getAppConfig(state, getForegroundAppId(state)).name,
  }),
  { 
    addApp, 
    switchForegroundApp,
  }
)(ClientApp)
