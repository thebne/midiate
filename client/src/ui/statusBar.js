import React from 'react'
import { connect } from 'react-redux'
import AppBar from '@material-ui/core/AppBar'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Zoom from '@material-ui/core/Zoom'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import AppDefaultIcon from '@material-ui/icons/MusicVideo'
import { makeStyles } from '@material-ui/core/styles'

import { PROGRAM_NAME, DEFAULT_APP_ID } from '../constants'
import { ReactComponent as Logo } from '../logo.svg'
import { 
  getForegroundAppId,
  getAppConfig,
} from '../redux/selectors'
import { 
  switchForegroundApp, 
} from '../redux/actions'


const useStyles = makeStyles(theme => ({
  toolbar: {
    display: 'flex',
    itemAlign: 'middle',
  },
  title: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  titleText: {
    cursor: 'pointer',
  },
	titleSecondaryText: {
		paddingLeft: theme.spacing(3),
    '& svg': {
      verticalAlign: 'middle',
      marginRight: theme.spacing(1),
    },
	},

  logo: {
    verticalAlign: 'middle',
    minWidth: 0,
    width: '50px',
    height: '50px',
    position: 'relative',
    marginRight: '1vw',
    '& svg': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '50px',
      height: '50px',
      cursor: 'pointer',
    }
  },

  statusBarItem: {
    fontFamily: "'Baloo Tamma 2', cursive",
    width: '5vw',
    minWidth: '3em',
  },
}))


function StatusBar({foregroundAppConfig, foregroundAppId, 
  statusBar, switchForegroundApp}) {
	const classes = useStyles()

  return (
				<AppBar position="absolute" 
            className={[classes.appBar, 'app-bar'].join(' ')}>
					<Toolbar className={classes.toolbar}>
            <AppTitle
              foregroundAppId={foregroundAppId}
              foregroundAppConfig={foregroundAppConfig}
              switchForegroundApp={switchForegroundApp}
            />
            <Box display={{xs: 'none', sm: 'initial'}}>
              {statusBar.map(item => item != null ? 
                <IconButton 
                  color="inherit" 
                  key={item.props.appId}
                  onClick={() => switchForegroundApp(item.props.appId)} 
                  className={classes.statusBarItem}
                >
                  {item}
                </IconButton> 
                : null)}
            </Box>
					</Toolbar>
				</AppBar>
  )
}

const AppTitle = React.memo(
  function AppTitle({foregroundAppId, foregroundAppConfig, switchForegroundApp}) {
	const classes = useStyles()
  return (
    <div className={classes.title}>
      <Button 
        onClick={() => switchForegroundApp(DEFAULT_APP_ID)}
        className={classes.logo}>
        <Zoom in={foregroundAppId === DEFAULT_APP_ID}>
          <Logo />
        </Zoom>
        <Zoom in={foregroundAppId !== DEFAULT_APP_ID}>
          <ArrowBackIcon />
        </Zoom>
      </Button>
      <Typography component="h1" variant="h5" color="inherit" noWrap
        onClick={() => switchForegroundApp(DEFAULT_APP_ID)} 
        className={classes.titleText}>
          {foregroundAppId !== DEFAULT_APP_ID
            ? <Box display={{xs: 'none', md: 'initial'}}>{PROGRAM_NAME}</Box> 
            : PROGRAM_NAME
          }
      </Typography>
      {foregroundAppConfig.name && (
        <Typography variant="subtitle1" color="inherit" noWrap className={classes.titleSecondaryText}>
          {foregroundAppConfig.icon || <AppDefaultIcon />}
          {foregroundAppConfig.name}
        </Typography>
      )}
    </div>
  )
})

export default connect((state) => ({
    foregroundAppId: getForegroundAppId(state),
    foregroundAppConfig: getAppConfig(state, getForegroundAppId(state)),
}), {
  switchForegroundApp
})(StatusBar)
