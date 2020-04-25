import React from 'react'
import { connect } from 'react-redux'
import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import AppDefaultIcon from '@material-ui/icons/MusicVideo'
import { 
  getForegroundAppId,
  getAppConfig,
} from '../redux/selectors'
import { 
  switchForegroundApp, 
} from '../redux/actions'

import { PROGRAM_NAME, DEFAULT_APP_ID } from '../constants'
import useStyles from './styles.js'
import { ReactComponent as Logo } from '../logo.svg'

function StatusBar({foregroundAppConfig, foregroundAppId, 
  statusBar, switchForegroundApp}) {
  const classes = useStyles()
  return (
				<AppBar position="absolute" 
            className={[classes.appBar, 'app-bar'].join(' ')}>
					<Toolbar className={classes.toolbar}>
						<div className={classes.title}>
              <Logo 
                  onClick={() => switchForegroundApp(DEFAULT_APP_ID)} 
                  className={classes.logo} />
							<Typography component="h1" variant="h5" color="inherit" noWrap >
                {PROGRAM_NAME}
							</Typography>
              {foregroundAppConfig.name && (
                <Typography variant="subtitle1" color="inherit" noWrap className={classes.titleSecondaryText}>
                  {foregroundAppConfig.icon || <AppDefaultIcon />}
                  {foregroundAppConfig.name}
                </Typography>
              )}
						</div>
            {statusBar.map(item => item != null ? 
              <IconButton color="inherit" style={{width: "5vw", minWidth: "3em"}}
                  key={item.props.appId} onClick={() => switchForegroundApp(item.props.appId)}>
                {item}
              </IconButton> 
              : null)}
					</Toolbar>
				</AppBar>
  )
}

export default connect((state) => ({
    foregroundAppId: getForegroundAppId(state),
    foregroundAppConfig: getAppConfig(state, getForegroundAppId(state)),
}), {
  switchForegroundApp
})(StatusBar)
