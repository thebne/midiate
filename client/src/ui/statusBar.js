import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'

import { PROGRAM_NAME } from '../constants'
import useStyles from './styles.js'

export default function StatusBar({foregroundAppName, foregroundAppId, 
  statusBar, switchForegroundApp}) {
	const classes = useStyles()
  return (
				<AppBar position="absolute" className={classes.appBar}>
					<Toolbar className={classes.toolbar}>
						<div className={classes.title}>
							<Typography component="h1" variant="h5" color="inherit" noWrap className={classes.titleText}>
								♫{PROGRAM_NAME}♫
							</Typography>
							<Typography variant="subtitle1" color="inherit" noWrap className={classes.titleSecondaryText}>
								{foregroundAppName}
							</Typography>
						</div>
            {statusBar.map(item => item != null ? 
              <IconButton color="inherit" style={{width: "5vw", minWidth: "3em"}}
                  key={item.props.appId} onClick={() => switchForegroundApp(item.props.appId)}>
                {item}
              </IconButton> 
              : null)}
            {foregroundAppId != null && 
			        <Button onClick={() => switchForegroundApp(null)} color="inherit"
									className={classes.backButton}>Back</Button>}
					</Toolbar>
				</AppBar>
  )
}
